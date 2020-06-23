<?php
//
// Description
// -----------
// Check current qsos for matching callsign, band and mode.
// 
// Arguments
// ---------
// ciniki: 
// tnid:            The ID of the current tenant.
// 
// Returns
// ---------
// 
function qruqsp_fielddaylog_checkDupe(&$ciniki, $tnid, $args) {

    //
    // Check for existing qso
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
        . "WHERE qruqsp_fielddaylog_qsos.tnid = '" . ciniki_core_dbQuote($ciniki, $tnid) . "' "
        . "AND qruqsp_fielddaylog_qsos.callsign = '" . ciniki_core_dbQuote($ciniki, $args['callsign']) . "' "
        . "AND qruqsp_fielddaylog_qsos.band = '" . ciniki_core_dbQuote($ciniki, $args['band']) . "' "
        . "AND qruqsp_fielddaylog_qsos.mode = '" . ciniki_core_dbQuote($ciniki, $args['mode']) . "' "
        . "";
    if( isset($args['id']) && $args['id'] != '' ) {
        $strsql .= "AND qruqsp_fielddaylog_qsos.id <> '" . ciniki_core_dbQuote($ciniki, $args['id']) . "' ";
    }
    $rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'qruqsp.fielddaylog', 'qso');
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.30', 'msg'=>'Unable to load contact', 'err'=>$rc['err']));
    }
    if( isset($rc['rows']) && count($rc['rows']) > 0 ) {
        return array('stat'=>'ok', 'dupe'=>'yes');
    }

    return array('stat'=>'ok', 'dupe'=>'no');
}
?>
