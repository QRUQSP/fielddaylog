<?php
//
// Description
// -----------
// This method will add a new qso for the tenant.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:        The ID of the tenant to add the QSO to.
//
// Returns
// -------
//
function qruqsp_fielddaylog_qsoAdd(&$ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'),
//        'qso_dt'=>array('required'=>'yes', 'blank'=>'no', 'type'=>'datetimetoutc', 'name'=>'UTC Date Time of QSO'),
        'callsign'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Callsign'),
        'class'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Class'),
        'section'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Section'),
        'band'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Band'),
        'mode'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Mode'),
        'frequency'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Frequency'),
        'operator'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Operator'),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];
    $args['callsign'] = strtoupper($args['callsign']);
    $args['class'] = strtoupper($args['class']);
    $args['section'] = strtoupper($args['section']);

    $dt = new DateTime('now', new DateTimezone('UTC'));
    $args['qso_dt'] = $dt->format('Y-m-d H:i;s');

    if( !in_array($args['mode'], array('CW', 'PH', 'DIG')) ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.13', 'msg'=>'Please choose a mode'));
    }

    //
    // Check access to tnid as owner
    //
    ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'checkAccess');
    $rc = qruqsp_fielddaylog_checkAccess($ciniki, $args['tnid'], 'qruqsp.fielddaylog.qsoAdd');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Load the sections
    //
    ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'sectionsLoad');
    $rc = qruqsp_fielddaylog_sectionsLoad($ciniki, $args['tnid']);
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.10', 'msg'=>'', 'err'=>$rc['err']));
    }
    $sections = $rc['sections'];

    //
    // Check the section is valid
    //
    if( !isset($sections[$args['section']]) ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.11', 'msg'=>'Invalid section'));
    }

    //
    // Start transaction
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionStart');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionRollback');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionCommit');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbAddModuleHistory');
    $rc = ciniki_core_dbTransactionStart($ciniki, 'qruqsp.fielddaylog');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Add the qso to the database
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectAdd');
    $rc = ciniki_core_objectAdd($ciniki, $args['tnid'], 'qruqsp.fielddaylog.qso', $args, 0x04);
    if( $rc['stat'] != 'ok' ) {
        ciniki_core_dbTransactionRollback($ciniki, 'qruqsp.fielddaylog');
        return $rc;
    }
    $qso_id = $rc['id'];

    //
    // Commit the transaction
    //
    $rc = ciniki_core_dbTransactionCommit($ciniki, 'qruqsp.fielddaylog');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Update the last_change date in the tenant modules
    // Ignore the result, as we don't want to stop user updates if this fails.
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'tenants', 'private', 'updateModuleChangeDate');
    ciniki_tenants_updateModuleChangeDate($ciniki, $args['tnid'], 'qruqsp', 'fielddaylog');

    //
    // Update the web index if enabled
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'hookExec');
    ciniki_core_hookExec($ciniki, $args['tnid'], 'ciniki', 'web', 'indexObject', array('object'=>'qruqsp.fielddaylog.qso', 'object_id'=>$qso_id));

    //
    // Update the map if new section
    //
    if( !isset($ciniki['session']['qruqsp.fielddaylog']['map_sections']) 
        || !in_array($args['section'], $ciniki['session']['qruqsp.fielddaylog']['map_sections'])
        ) {
        //
        // Check cache
        //
        ciniki_core_loadMethod($ciniki, 'ciniki', 'tenants', 'hooks', 'cacheDir');
        $rc = ciniki_tenants_hooks_cacheDir($ciniki, $args['tnid'], array());
        if( $rc['stat'] != 'ok' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.12', 'msg'=>'', 'err'=>$rc['err']));
        }
        $cache_file = $rc['cache_dir'] . '/fielddaymap.jpg';

        $map = new Imagick($cache_file);
        $map->setImageCompressionQuality(60);
        
        if( isset($args['section']) ) {
            $overlay = new Imagick($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/' . $args['section'] . '.png');
            $overlay->paintTransparentImage("rgb(111,196,249)", 0, 3000);
            $map->compositeImage($overlay, Imagick::COMPOSITE_DEFAULT, 0, 0);
        }
        $map->writeImage($cache_file);

        $ciniki['session']['qruqsp.fielddaylog']['map_sections'][] = $args['section'];
        sort($ciniki['session']['qruqsp.fielddaylog']['map_sections']);
    }

    ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'public', 'get');
    return qruqsp_fielddaylog_get($ciniki);
}
?>
