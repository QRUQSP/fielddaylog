<?php
//
// Description
// -----------
// This method will return the list of QSOs for a tenant.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:        The ID of the tenant to get QSO for.
//
// Returns
// -------
//
function qruqsp_fielddaylog_qsoList($ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];

    //
    // Check access to tnid as owner, or sys admin.
    //
    ciniki_core_loadMethod($ciniki, 'qruqsp', 'fielddaylog', 'private', 'checkAccess');
    $rc = qruqsp_fielddaylog_checkAccess($ciniki, $args['tnid'], 'qruqsp.fielddaylog.qsoList');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Load the settings
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbDetailsQuery');
    $rc = ciniki_core_dbDetailsQuery($ciniki, 'qruqsp_fielddaylog_settings', 'tnid', $args['tnid'], 'qruqsp.fielddaylog', 'settings', '');
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.17', 'msg'=>'', 'err'=>$rc['err']));
    }
    $settings = isset($rc['settings']) ? $rc['settings'] : array();

    //
    // Get the list of qsos
    //
    $strsql = "SELECT qruqsp_fielddaylog_qsos.id, "
        . "qruqsp_fielddaylog_qsos.qso_dt, "
        . "DATE_FORMAT(qruqsp_fielddaylog_qsos.qso_dt, '%b %d %H:%i') AS qso_dt_display, "
        . "qruqsp_fielddaylog_qsos.callsign, "
        . "qruqsp_fielddaylog_qsos.class, "
        . "qruqsp_fielddaylog_qsos.section, "
        . "qruqsp_fielddaylog_qsos.band, "
        . "qruqsp_fielddaylog_qsos.mode, "
        . "qruqsp_fielddaylog_qsos.frequency, "
        . "qruqsp_fielddaylog_qsos.flags, "
        . "qruqsp_fielddaylog_qsos.operator, "
        . "qruqsp_fielddaylog_qsos.notes "
        . "FROM qruqsp_fielddaylog_qsos "
        . "WHERE qruqsp_fielddaylog_qsos.tnid = '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' "
        . "ORDER BY qso_dt DESC "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'qruqsp.fielddaylog', array(
        array('container'=>'qsos', 'fname'=>'id', 
            'fields'=>array('id', 'qso_dt', 'qso_dt_display', 'callsign', 'class', 'section', 
                'band', 'mode', 'frequency', 'flags', 'operator', 'notes',
                )),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    if( isset($rc['qsos']) ) {
        $qsos = $rc['qsos'];
        $qso_ids = array();
        foreach($qsos as $iid => $qso) {
            $qso_ids[] = $qso['id'];
            if( $qso['frequency'] != '' ) {
                $freq = preg_replace("/[^0-9]/", "", $qso['frequency']);
                $freq = preg_replace("/^(4[2-5][0-9]|22[2-5]|14[4-8]|5[0-4]|2[8-9]|21|14|7|3|1)/", "$1.", $freq);
                if( ($qso['band'] == 160 && strncmp("1.", $freq, 2) != 0 )
                    || ($qso['band'] == 80 && strncmp("3.", $freq, 2) != 0 )
                    || ($qso['band'] == 40 && strncmp("7.", $freq, 2) != 0 )
                    || ($qso['band'] == 20 && strncmp("14.", $freq, 3) != 0 )
                    || ($qso['band'] == 15 && strncmp("21.", $freq, 3) != 0 )
                    || ($qso['band'] == 10 && !preg_match("/^2[8-9]\./", $freq))
                    || ($qso['band'] == 6 && !preg_match("/^5[0-4]\./", $freq))
                    || ($qso['band'] == 2 && !preg_match("/^14[4-8]\./", $freq))
                    || ($qso['band'] == 220 && !preg_match("/^22[2-5]\./", $freq))
                    || ($qso['band'] == 440 && !preg_match("/^4[2-5][0-9]\./", $freq))
                    ) {
                    $qsos[$iid]['freqbanderror'] = 'mismatch';
                }
            }
        }
    } else {
        $qsos = array();
        $qso_ids = array();
    }

    return array('stat'=>'ok', 'qsos'=>$qsos, 'nplist'=>$qso_ids, 'settings'=>$settings);
}
?>
