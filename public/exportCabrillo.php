<?php
//
// Description
// -----------
// This method will return everything for the UI for Field Day Logger
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
function qruqsp_fielddaylog_exportCabrillo($ciniki) {
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

    //
    // Load the date format strings for the user
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'datetimeFormat');
    $datetime_format = ciniki_users_datetimeFormat($ciniki, 'php');

    $areas = array(
        'DX' => array(
            'name' => 'DX', 
            'sections' => array(
                array('label' => 'DX', 'name' => 'DX'),
            ),
        ),
        '_1' => array(
            'name' => '1', 
            'sections' => array(
                array('label' => 'CT', 'name' => 'Connecticut'),
                array('label' => 'EMA', 'name' => 'Eastern Massachusetts'),
                array('label' => 'ME', 'name' => 'Maine'),
                array('label' => 'NH', 'name' => 'New Hampshire'),
                array('label' => 'RI', 'name' => 'Rhode Island'),
                array('label' => 'VT', 'name' => 'Vermont'),
                array('label' => 'WMA', 'name' => 'Western Massachusetts'),
            ),
        ),
        '_2' => array(
            'name' => '2', 
            'sections' => array(
                array('label' => 'ENY', 'name' => 'Eastern New York'),
                array('label' => 'NLI', 'name' => 'NYC/Long Island'),
                array('label' => 'NNJ', 'name' => 'Northern New Jersey'),
                array('label' => 'NNY', 'name' => 'Northern New York'),
                array('label' => 'SNJ', 'name' => 'Southern New Jersey'),
                array('label' => 'WNY', 'name' => 'Western New York'),
            ),
        ),
        '_3' => array(
            'name' => '3', 
            'sections' => array(
                array('label' => 'DE', 'name' => 'Delaware'),
                array('label' => 'EPA', 'name' => 'Eastern Pennsylvania'),
                array('label' => 'MDC', 'name' => 'Maryland - DC'),
                array('label' => 'WPA', 'name' => 'Western Pennsylvania'),
            ),
        ),
        '_4' => array(
            'name' => '4', 
            'sections' => array(
                array('label' => 'AL', 'name' => 'Alabama'),
                array('label' => 'GA', 'name' => 'Georgia'),
                array('label' => 'KY', 'name' => 'Kentucky'),
                array('label' => 'NC', 'name' => 'North Carolina'),
                array('label' => 'NFL', 'name' => 'Northern Florida'),
                array('label' => 'SC', 'name' => 'South Carolina'),
                array('label' => 'SFL', 'name' => 'Southern Florida'),
                array('label' => 'TN', 'name' => 'Tennessee'),
                array('label' => 'VA', 'name' => 'Virginia'),
                array('label' => 'WCF', 'name' => 'West Central Florida'),
                array('label' => 'PR', 'name' => 'Puerto Rico'),
                array('label' => 'VI', 'name' => 'US Virgin Islands'),
            ),
        ),
        '_5' => array(
            'name' => '5', 
            'sections' => array(
                array('label' => 'AR', 'name' => 'Arkansas'),
                array('label' => 'LA', 'name' => 'Louisiana'),
                array('label' => 'MS', 'name' => 'Mississippi'),
                array('label' => 'NM', 'name' => 'New Mexico'),
                array('label' => 'NTX', 'name' => 'North Texas'),
                array('label' => 'OK', 'name' => 'Oklahoma'),
                array('label' => 'STX', 'name' => 'South Texas'),
                array('label' => 'WTX', 'name' => 'West Texas'),
            ),
        ),
        '_6' => array(
            'name' => '6', 
            'sections' => array(
                array('label' => 'EB', 'name' => 'East Bay'),
                array('label' => 'LAX', 'name' => 'Los Angeles'),
                array('label' => 'ORG', 'name' => 'Orange'),
                array('label' => 'SB', 'name' => 'Santa Barbara'),
                array('label' => 'SCV', 'name' => 'Santa Clara Valley'),
                array('label' => 'SDG', 'name' => 'San Diego'),
                array('label' => 'SF', 'name' => 'San Francisco'),
                array('label' => 'SJV', 'name' => 'San Joaquin Valley'),
                array('label' => 'SV', 'name' => 'Sacramento Valley'),
                array('label' => 'PAC', 'name' => 'Pacific'),
            ),
        ),
        '_7' => array(
            'name' => '7', 
            'sections' => array(
                array('label' => 'AK', 'name' => 'Alaska'),
                array('label' => 'AZ', 'name' => 'Arizona'),
                array('label' => 'EWA', 'name' => 'Eastern Washington'),
                array('label' => 'ID', 'name' => 'Idaho'),
                array('label' => 'MT', 'name' => 'Montana'),
                array('label' => 'NV', 'name' => 'Nevada'),
                array('label' => 'OR', 'name' => 'Oregon'),
                array('label' => 'UT', 'name' => 'Utah'),
                array('label' => 'WWA', 'name' => 'Western Washington'),
                array('label' => 'WY', 'name' => 'Wyoming'),
            ),
        ),
        '_8' => array(
            'name' => '8', 
            'sections' => array(
                array('label' => 'MI', 'name' => 'Michigan'),
                array('label' => 'OH', 'name' => 'Ohio'),
                array('label' => 'WV', 'name' => 'West Virginia'),
            ),
        ),
        '_9' => array(
            'name' => '9', 
            'sections' => array(
                array('label' => 'IL', 'name' => 'Illinois'),
                array('label' => 'IN', 'name' => 'Indiana'),
                array('label' => 'WI', 'name' => 'Wisconsin'),
            ),
        ),
        '_0' => array(
            'name' => '0', 
            'sections' => array(
                array('label' => 'CO', 'name' => 'Colorado'),
                array('label' => 'IA', 'name' => 'Iowa'),
                array('label' => 'KS', 'name' => 'Kansas'),
                array('label' => 'MN', 'name' => 'Minnesota'),
                array('label' => 'MO', 'name' => 'Missouri'),
                array('label' => 'NE', 'name' => 'Nebraska'),
                array('label' => 'ND', 'name' => 'North Dakota'),
                array('label' => 'SD', 'name' => 'South Dakota'),
            ),
        ),
        'CANADA' => array(
            'name' => 'CA', 
            'sections' => array(
                array('label' => 'AB', 'name' => 'Alberta'),
                array('label' => 'BC', 'name' => 'British Columbia'),
                array('label' => 'GTA', 'name' => 'Greater Toronto Area'),
                array('label' => 'MAR', 'name' => 'Maritime'),
                array('label' => 'MB', 'name' => 'Manitoba'),
                array('label' => 'NL', 'name' => 'Newfoundland/Labrador'),
                array('label' => 'NT', 'name' => 'Northern Territories'),
                array('label' => 'ONE', 'name' => 'Ontario East'),
                array('label' => 'ONN', 'name' => 'Ontario North'),
                array('label' => 'ONS', 'name' => 'Ontario South'),
                array('label' => 'PE', 'name' => 'Prince Edward Island'),
                array('label' => 'QC', 'name' => 'Quebec'),
                array('label' => 'SK', 'name' => 'Saskatchewan'),
            ),
        ),
    );

    $sections = array();
    foreach($areas as $aid => $area) {
        foreach($area['sections'] as $sid => $section) {
            $sections[$section['label']] = array(
                'areas' => $aid,
                'name' => $section['name'],
                'num_qsos' => 0,
                );
        }
    }
    
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
        . "qruqsp_fielddaylog_qsos.operator "
        . "FROM qruqsp_fielddaylog_qsos "
        . "WHERE qruqsp_fielddaylog_qsos.tnid = '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' "
        . "AND YEAR(qso_dt) = 2020 "
        . "ORDER BY qso_dt DESC "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'qruqsp.fielddaylog', array(
        array('container'=>'qsos', 'fname'=>'id', 
            'fields'=>array('id', 'qso_dt', 'qso_dt_display', 'callsign', 'class', 'section', 'band', 'mode', 'frequency', 'operator'),
            ),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $qsos = isset($rc['qsos']) ? $rc['qsos'] : array();

    $rsp = array('stat'=>'ok', 'qsos'=>$qsos, 'areas'=>$areas, 'sections'=>$sections, 'settings'=>$settings);

    $bands = array();
    $modes = array(
        'CW' => 0,
        'PH' => 0,
        'DIG' => 0,
        );
    $rsp['band'] = '';
    $rsp['mode'] = '';
    $rsp['frequency'] = '';
    $rsp['mode_band_stats'] = array();
    foreach(['CW'=>'CW', 'PH'=>'PH', 'DIG'=>'DIG', 'totals'=>'Totals'] as $k => $v) {
        $rsp['mode_band_stats'][$k] = array(
            'label' => $v,
            '160' => array('label' => '160 M', 'num_qsos' => 0),
            '80' => array('label' => '80 M', 'num_qsos' => 0),
            '40' => array('label' => '40 M', 'num_qsos' => 0),
            '20' => array('label' => '20 M', 'num_qsos' => 0),
            '15' => array('label' => '15 M', 'num_qsos' => 0),
            '10' => array('label' => '10 M', 'num_qsos' => 0),
            '6' => array('label' => '6 M', 'num_qsos' => 0),
            '2' => array('label' => '2 M', 'num_qsos' => 0),
            '220' => array('label' => '1.25 M', 'num_qsos' => 0),
            '440' => array('label' => '70 Cm', 'num_qsos' => 0),
            'satellite' => array('label' => 'SAT', 'num_qsos' => 0),
            'gota' => array('label' => 'GOTA', 'num_qsos' => 0),
            'other' => array('label' => 'OTHER', 'num_qsos' => 0),
            'totals' => array('label' => 'Totals', 'num_qsos' => 0),
            );
    }
    $rsp['section_band_stats'] = array();
    
    foreach($sections as $label => $section) {
        $rsp['section_band_stats'][$label] = array(
            'label' => $label,
            '160' => array('label' => '160 M', 'num_qsos' => 0),
            '80' => array('label' => '80 M', 'num_qsos' => 0),
            '40' => array('label' => '40 M', 'num_qsos' => 0),
            '20' => array('label' => '20 M', 'num_qsos' => 0),
            '15' => array('label' => '15 M', 'num_qsos' => 0),
            '10' => array('label' => '10 M', 'num_qsos' => 0),
            '6' => array('label' => '6 M', 'num_qsos' => 0),
            '2' => array('label' => '2 M', 'num_qsos' => 0),
            '220' => array('label' => '1.25 M', 'num_qsos' => 0),
            '440' => array('label' => '70 Cm', 'num_qsos' => 0),
            'satellite' => array('label' => 'SAT', 'num_qsos' => 0),
            'gota' => array('label' => 'GOTA', 'num_qsos' => 0),
            'other' => array('label' => 'OTHER', 'num_qsos' => 0),
            'totals' => array('label' => 'Totals', 'num_qsos' => 0),
            );
    }
    $rsp['section_band_stats']['totals'] = array(
        'label' => 'Totals',
        '160' => array('label' => '160 M', 'num_qsos' => 0),
        '80' => array('label' => '80 M', 'num_qsos' => 0),
        '40' => array('label' => '40 M', 'num_qsos' => 0),
        '20' => array('label' => '20 M', 'num_qsos' => 0),
        '15' => array('label' => '15 M', 'num_qsos' => 0),
        '10' => array('label' => '10 M', 'num_qsos' => 0),
        '6' => array('label' => '6 M', 'num_qsos' => 0),
        '2' => array('label' => '2 M', 'num_qsos' => 0),
        '220' => array('label' => '1.25 M', 'num_qsos' => 0),
        '440' => array('label' => '70 Cm', 'num_qsos' => 0),
        'satellite' => array('label' => 'SAT', 'num_qsos' => 0),
        'gota' => array('label' => 'GOTA', 'num_qsos' => 0),
        'other' => array('label' => 'OTHER', 'num_qsos' => 0),
        'totals' => array('label' => 'Totals', 'num_qsos' => 0),
        );

    //
    // Get stats
    //
    foreach($qsos as $qso) {
        if( $rsp['band'] == '' ) {
            $rsp['band'] = $qso['band'];
            $rsp['mode'] = $qso['mode'];
            $rsp['frequency'] = $qso['frequency'];
        }
        $section = $qso['section'];
        if( isset($rsp['sections'][$section]) ) {
            $rsp['sections'][$section]['num_qsos']++;
        }
        if( !isset($bands[$qso['band']]) ) {
            $bands[$qso['band']] = 1;
        } else {
            $bands[$qso['band']]++;
        }
        if( !isset($modes[$qso['mode']]) ) {
            $modes[$qso['mode']] = 1;
        } else {
            $modes[$qso['mode']]++;
        }
        if( isset($rsp['mode_band_stats'][$qso['mode']][$qso['band']]) ) {
            $rsp['mode_band_stats'][$qso['mode']][$qso['band']]['num_qsos']++;
            $rsp['mode_band_stats'][$qso['mode']]['totals']['num_qsos']++;
            $rsp['mode_band_stats']['totals'][$qso['band']]['num_qsos']++;
            $rsp['mode_band_stats']['totals']['totals']['num_qsos']++;
        } else {
            error_log('unknown mode: ' . $qso['mode'] . ' band: ' . $qso['band']);
            error_log(print_r($qso,true));
        }
        if( isset($rsp['section_band_stats'][$qso['section']][$qso['band']]) ) {
            $rsp['section_band_stats'][$qso['section']][$qso['band']]['num_qsos']++;
            $rsp['section_band_stats'][$qso['section']]['totals']['num_qsos']++;
            $rsp['section_band_stats']['totals'][$qso['band']]['num_qsos']++;
            $rsp['section_band_stats']['totals']['totals']['num_qsos']++;
        } else {
            error_log('unknown section: ' . $qso['section'] . ' band: ' . $qso['band']);
            error_log(print_r($qso,true));
        }
    }

    //
    // Calculate score
    //
    $qso_points = ($modes['CW']*2) + ($modes['DIG']*2) + $modes['PH'];
    $rsp['scores'] = array(
        array('label' => 'Phone Contacts', 'value' => $modes['PH']),
        array('label' => 'CW Contacts', 'value' => $modes['CW']),
        array('label' => 'Digital Contacts', 'value' => $modes['DIG']),
        array('label' => 'Contact Points', 'value' => $qso_points),
        );

    $rsp['mydetails'] = array(
        array('label' => 'Callsign', 'value' => (isset($settings['callsign']) ? $settings['callsign'] : '')),
        array('label' => 'Class', 'value' => (isset($settings['class']) ? $settings['class'] : '')),
        array('label' => 'Section', 'value' => (isset($settings['section']) ? $settings['section'] : '')),
        );

    //
    // Setup areas vertical
    //
    $vareas = array();
    $row = array();
    foreach($areas as $aid => $area) {
        $row[] = array('label' => $area['name']);
    }
//    $vareas[] = $row;
    for($i = 0; $i < 13; $i++) {    
        $row = array();
        foreach($areas as $aid => $area) {
            if( isset($area['sections'][$i]['label']) ) {
                $row[] = array('label' => $area['sections'][$i]['label']);
            } else {
                $row[] = array('label' => '');
            }
        }
        $vareas[] = $row;
    }
    $rsp['vareas'] = $vareas;

    //
    // Get the recent qsos
    //
    $rsp['recent'] = array_slice($qsos, 0, 25);

    return $rsp;
}
?>
