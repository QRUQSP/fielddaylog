<?php
//
// Description
// ===========
//
// Arguments
// ---------
//
// Returns
// -------
//
function qruqsp_fielddaylog_qsoUpdate(&$ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'),
        'qso_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'QSO'),
        'qso_dt'=>array('required'=>'no', 'blank'=>'no', 'type'=>'datetime', 'name'=>'UTC Date Time of QSO'),
        'callsign'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Call Sign'),
        'class'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Class'),
        'section'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Section'),
        'band'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Band'),
        'mode'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Mode'),
        'frequency'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Frequency'),
        'operator'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Operator'),
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Options'),
        'notes'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Notes'),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];

    //
    // Make sure this module is activated, and
    // check permission to run this function for this tenant
    //
    ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'checkAccess');
    $rc = qruqsp_fielddaylog_checkAccess($ciniki, $args['tnid'], 'qruqsp.fielddaylog.qsoUpdate');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Uppercase the fields
    //
    if( isset($args['callsign']) ) {
        $args['callsign'] = strtoupper($args['callsign']);
    }
    if( isset($args['class']) ) {
        $args['class'] = trim(strtoupper($args['class']));
        if( !preg_match("/^[0-9]+[A-F]$/", $args['class']) ) {
            return array('stat'=>'warn', 'err'=>array('code'=>'qruqsp.fielddaylog.25', 'msg'=>'Invalid class, must be in the format NumberLetter, EG: 1D, 4E'));
        }
    }
    if( isset($args['section']) ) {
        $args['section'] = strtoupper($args['section']);
        //
        // Load the sections
        //
        ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'sectionsLoad');
        $rc = qruqsp_fielddaylog_sectionsLoad($ciniki, $args['tnid']);
        if( $rc['stat'] != 'ok' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.21', 'msg'=>'Unable to load sections', 'err'=>$rc['err']));
        }
        $sections = $rc['sections'];

        //
        // Check the section is valid
        //
        if( !isset($sections[$args['section']]) ) {
            return array('stat'=>'warn', 'err'=>array('code'=>'qruqsp.fielddaylog.24', 'msg'=>'Invalid section'));
        }
    }
    if( isset($args['mode']) && !in_array($args['mode'], array('CW', 'PH', 'DIG')) ) {
        return array('stat'=>'warn', 'err'=>array('code'=>'qruqsp.fielddaylog.28', 'msg'=>'Please choose a mode'));
    }

    //
    // Load existing qso
    //
    $strsql = "SELECT qruqsp_fielddaylog_qsos.id, "
        . "qruqsp_fielddaylog_qsos.qso_dt, "
        . "qruqsp_fielddaylog_qsos.callsign, "
        . "qruqsp_fielddaylog_qsos.class, "
        . "qruqsp_fielddaylog_qsos.section, "
        . "qruqsp_fielddaylog_qsos.band, "
        . "qruqsp_fielddaylog_qsos.mode, "
        . "qruqsp_fielddaylog_qsos.frequency, "
        . "qruqsp_fielddaylog_qsos.operator, "
        . "qruqsp_fielddaylog_qsos.notes "
        . "FROM qruqsp_fielddaylog_qsos "
        . "WHERE qruqsp_fielddaylog_qsos.tnid = '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' "
        . "AND qruqsp_fielddaylog_qsos.id = '" . ciniki_core_dbQuote($ciniki, $args['qso_id']) . "' "
        . "";
    $rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'qruqsp.fielddaylog', 'qso');
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.30', 'msg'=>'Unable to load contact', 'err'=>$rc['err']));
    }
    if( !isset($rc['qso']) ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.31', 'msg'=>'Unable to find requested contact'));
    }
    $qso = $rc['qso'];
    
    //
    // Load the settings
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbDetailsQuery');
    $rc = ciniki_core_dbDetailsQuery($ciniki, 'qruqsp_fielddaylog_settings', 'tnid', $args['tnid'], 'qruqsp.fielddaylog', 'settings', '');
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.19', 'msg'=>'Unable to load settings', 'err'=>$rc['err']));
    }
    $settings = isset($rc['settings']) ? $rc['settings'] : array();

    //
    // Check if allow-dupes is set and no
    //
    if( isset($settings['allow-dupes']) && $settings['allow-dupes'] == 'no' ) {
        //
        // Check for dupe
        //
        ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'checkDupe');
        $rc = qruqsp_fielddaylog_checkDupe($ciniki, $args['tnid'], array(
            'id' => $args['qso_id'],
            'callsign' => (isset($args['callsign']) ? $args['callsign'] : $qso['callsign']),
            'band' => (isset($args['band']) ? $args['band'] : $qso['band']),
            'mode' => (isset($args['mode']) ? $args['mode'] : $qso['mode']),
            ));
        if( $rc['stat'] != 'ok' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.29', 'msg'=>'Unable to check for dupe', 'err'=>$rc['err']));
        }
        if( isset($rc['dupe']) && $rc['dupe'] == 'yes' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.30', 'msg'=>'Duplicate contact.'));
        }
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
    // Update the QSO in the database
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectUpdate');
    $rc = ciniki_core_objectUpdate($ciniki, $args['tnid'], 'qruqsp.fielddaylog.qso', $args['qso_id'], $args, 0x04);
    if( $rc['stat'] != 'ok' ) {
        ciniki_core_dbTransactionRollback($ciniki, 'qruqsp.fielddaylog');
        return $rc;
    }

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
    ciniki_core_hookExec($ciniki, $args['tnid'], 'ciniki', 'web', 'indexObject', array('object'=>'qruqsp.fielddaylog.qso', 'object_id'=>$args['qso_id']));

    return array('stat'=>'ok');
}
?>
