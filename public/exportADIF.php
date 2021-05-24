<?php
//
// Description
// -----------
// This method will create a adif file for field day contacts
//
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
function qruqsp_fielddaylog_exportADIF($ciniki) {
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
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.9', 'msg'=>'', 'err'=>$rc['err']));
    }
    $settings = isset($rc['settings']) ? $rc['settings'] : array();

    $dt = new DateTime('now', new DateTimezone('UTC'));

    //
    // Load the date format strings for the user
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'datetimeFormat');
    $datetime_format = ciniki_users_datetimeFormat($ciniki, 'php');

    //
    // Get the list of qsos
    //
    $strsql = "SELECT qruqsp_fielddaylog_qsos.id, "
        . "qruqsp_fielddaylog_qsos.qso_dt, "
        . "DATE_FORMAT(qruqsp_fielddaylog_qsos.qso_dt, '%Y%m%d') AS qso_date, "
        . "DATE_FORMAT(qruqsp_fielddaylog_qsos.qso_dt, '%H%i%s') AS qso_time, "
        . "qruqsp_fielddaylog_qsos.callsign, "
        . "qruqsp_fielddaylog_qsos.class, "
        . "qruqsp_fielddaylog_qsos.section, "
        . "qruqsp_fielddaylog_qsos.band, "
        . "qruqsp_fielddaylog_qsos.mode, "
        . "qruqsp_fielddaylog_qsos.frequency, "
        . "qruqsp_fielddaylog_qsos.operator "
        . "FROM qruqsp_fielddaylog_qsos "
        . "WHERE qruqsp_fielddaylog_qsos.tnid = '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' "
        . "AND YEAR(qso_dt) = 2021 "
        . "ORDER BY qso_dt ASC "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'qruqsp.fielddaylog', array(
        array('container'=>'qsos', 'fname'=>'id', 
            'fields'=>array('id', 'qso_dt', 'qso_date', 'qso_time', 'callsign', 'class', 'section', 'band', 'mode', 'frequency', 'operator'),
            ),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $qsos = isset($rc['qsos']) ? $rc['qsos'] : array();

    //
    // Process QSOs
    //
    $adif_qsos = '';
    $bands = array();
    $modes = array();
    $qso_points = 0;
    foreach($qsos as $qso) {
        if( !in_array($qso['band'], $bands) ) {
            $bands[] = $qso['band'];
        }
        if( !in_array($qso['mode'], $modes) ) {
            $modes[] = $qso['mode'];
        }
        if( $qso['mode'] == 'CW' || $qso['mode'] == 'DIG' ) {
            $qso_points += 2;
        } else {
            $qso_points += 1;
        }
        $adif_qsos .= "<CALL:" . strlen($qso['callsign']) . ">" . $qso['callsign'];
        $adif_qsos .= "<QSO_DATE:" . strlen($qso['qso_date']) . ">" . $qso['qso_date'];
        $adif_qsos .= "<TIME_ON:" . strlen($qso['qso_time']) . ">" . $qso['qso_time'];
        $adif_qsos .= "<ARRL_SECT:" . strlen($qso['section']) . ">" . $qso['section'];
        $adif_qsos .= "<CLASS:" . strlen($qso['class']) . ">" . $qso['class'];
        if( $qso['band'] == '220' ) {
            $adif_qsos .= "<BAND:5>1.25M";
        } elseif( $qso['band'] == '440' ) {
            $adif_qsos .= "<BAND:4>70CM";
        } else {
            $adif_qsos .= "<BAND:" . (strlen($qso['band'])+1) . ">" . $qso['band'] . "M";
        }
        $adif_qsos .= "<STATION_CALLSIGN:" . strlen($settings['callsign']) . ">" . $qso['callsign'];
        if( $qso['frequency'] != '' ) {
            $qso['frequency'] = preg_replace("/[^0-9]/", "", $qso['frequency']);
            $qso['frequency'] = preg_replace("/^(4[2-5][0-9]|22[2-5]|14[4-8]|5[0-4]|2[8-9]|21|14|7|3|1)/", "$1.", $qso['frequency']);
        } else {
            switch($qso['band']) {
                case 160: $qso['frequency'] = 1.800; break;
                case 80: $qso['frequency'] = 3.500; break;
                case 40: $qso['frequency'] = 7.000; break;
                case 20: $qso['frequency'] = 14.000; break;
                case 15: $qso['frequency'] = 21.000; break;
                case 10: $qso['frequency'] = 28.000; break;
                case 6: $qso['frequency'] = 50; break;
                case 2: $qso['frequency'] = 144; break;
                case 220: $qso['frequency'] = 222; break;
                case 440: $qso['frequency'] = 440; break;
            }
        }
        $adif_qsos .= "<FREQ:" . strlen($qso['frequency']) . ">" . $qso['frequency'];
        $adif_qsos .= "<CONTEST_ID:14>ARRL-FIELD-DAY";
        $adif_qsos .= "<MODE:" . strlen($qso['mode']) . ">" . $qso['mode'];
        if( $qso['mode'] == 'CW' ) {
            $adif_qsos .= "<RST_RCVD:3>599";
            $adif_qsos .= "<RST_SENT:3>599";
        } else {
            $adif_qsos .= "<RST_RCVD:2>59";
            $adif_qsos .= "<RST_SENT:2>59";
        }
        if( $qso['operator'] != '' ) {
            $adif_qsos .= "<OPERATOR:" . strlen($qso['operator']) . ">" . $qso['operator'];
        }

        $adif_qsos .= "<EOR>\r\n";
    }

    $adif = '';
    $adif .= "ADIF Export from QRUQSP.org\r\n";
    if( isset($settings['callsign']) && $settings['callsign'] != '' ) {
        $adif .= $settings['callsign'] . " logs generated @ " . $dt->format('Y-m-d H:i:s') . "Z\r\n";
    }
    $adif .= "Contest Name: FD - 2021\r\n";
    $adif .= "<EOH>\r\n";


    $adif .= $adif_qsos;

    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT', true, 200);
    header("Content-type: text/plain");
    header('Content-Disposition: attachment; filename="fieldday2021.adi"');

    print $adif;
    
    return array('stat'=>'exit');
}
?>
