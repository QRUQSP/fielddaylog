//
// This is the main app for the fielddaylog module
//
function qruqsp_fielddaylog_main() {
    this.bandOptions = {
        '160':'160 M', 
        '80':'80 M', 
        '40':'40 M', 
        '20':'20 M', 
        '15':'15 M', 
        '10':'10 M', 
        '6':'6 M', 
        '2':'2 M', 
        '220':'1.25 M', 
        '440':'70 CM', 
        'other':'Other', 
        'satellite':'Satellite', 
//        'gota':'GOTA', 
    };
    //
    // The panel to list the qso
    //
    this.menu = new M.panel('Field Day Logger', 'qruqsp_fielddaylog_main', 'menu', 'mc', 'xlarge narrowaside', 'sectioned', 'qruqsp.fielddaylog.main.menu');
    this.menu.data = {};
    this.menu.nplist = [];
    this.menu.uisize = 'normal';
    this.menu.sections = {
        'qso':{'label':'Contact', 'aside':'yes', 'fields':{
            'callsign':{'label':'Call Sign', 'type':'text', 'autofocus':'yes',
//                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                'livesearch':'yes', 'livesearchcols':3,
                },
            'class':{'label':'Class', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            'section':{'label':'Section', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            'frequency':{'label':'Frequency', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            'band':{'label':'Band', 'type':'select', 
                'onchange':'M.qruqsp_fielddaylog_main.menu.updateDups',
                'options':this.bandOptions},
            'mode':{'label':'Mode', 'type':'toggle', 
                'onchange':'M.qruqsp_fielddaylog_main.menu.updateDups',
                'toggles':{'CW':'CW', 'PH':'PH', 'DIG':'DIG'},
                },
            'flags1':{'label':'GOTA', 'type':'flagtoggle', 'default':'off', 'bit':0x01, 'field':'flags',
                'visible':'no',
//                'onchange':'M.qruqsp_fielddaylog_main.menu.updateDups',
//                'toggles':{'CW':'CW', 'PH':'PH', 'DIG':'DIG'},
                },
            'operator':{'label':'Operator', 'type':'text', 'visible':'no',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.updateStorage',
                },
            }},
        '_notes':{'label':'Notes', 'visible':'hidden', 'aside':'yes', 'fields':{
            'notes':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'small'},
            }},
//        'compact_dups':{'label':'', 'type':'simplegrid', 'num_cols':3,
//            'visible':function() { return M.size == 'compact' ? 'yes' : 'no'; },
//            'cellClasses':['multiline', 'multiline', 'multiline'],
//            },
        '_add':{'label':'', 'aside':'yes', 'size':'half', 'buttons':{
            'add':{'label':'Add Contact', 'fn':'M.qruqsp_fielddaylog_main.menu.addQSO();'},
            'bookmark':{'label':'Add Bookmark', 
                'visible':function() { return M.modFlagSet('qruqsp.fielddaylog', 0x10); },
                'fn':'M.qruqsp_fielddaylog_main.menu.bookmarkAdd();',
                },
            }},
        'bookmarks':{'label':'', 'aside':'yes', 'type':'simplegrid', 'num_cols':3,
            'visible':function() { return M.qruqsp_fielddaylog_main.menu.data.bookmarks != null ? 'yes' : 'no'; },
            'cellClasses':['', '', 'fabuttons'],
            'rowFn':function(i, d) {
                return 'M.qruqsp_fielddaylog_main.menu.bookmarkOpen(\'' + i + '\');';
                },
            },
        'mydetails':{'label':'My Details', 'type':'simplegrid', 'num_cols':2, 'aside':'yes',
            'visible':function() { return M.size != 'compact' ? 'yes' : 'no'; },
            'cellClasses':['bold',''],
            },
        'scores':{'label':'', 'type':'simplegrid', 'num_cols':2, 'aside':'yes',
            'cellClasses':['bold',''],
            },
        '_buttons':{'label':'', 'aside':'yes', 'buttons':{
            'all':{'label':'Contact List', 'fn':'M.qruqsp_fielddaylog_main.qsos.open(\'M.qruqsp_fielddaylog_main.menu.open();\');'},
            'monitor':{'label':'Open Dashboard', 'fn':'M.qruqsp_fielddaylog_main.menu.openMonitor();'},
            'cabrillo':{'label':'Download Cabrillo', 'fn':'M.qruqsp_fielddaylog_main.menu.downloadCabrillo();'},
            'adif':{'label':'Download ADIF', 'fn':'M.qruqsp_fielddaylog_main.menu.downloadADIF();'},
            'excel':{'label':'Download Excel', 'fn':'M.qruqsp_fielddaylog_main.menu.downloadExcel();'},

            }},
//        'duplicates':{'label':'Duplicates', 'type':'simplegrid', 'num_cols':6, //'panelcolumn':1,
//            'visible':function() { return M.size != 'compact' ? 'yes' : 'no'; },
//            'headerValues':['Date/Time', 'Call Sign', 'Class', 'Section', 'Band', 'Mode'],
//            'noData':'No duplicates found',
//            'rowFn':function(i, d) {
//                return 'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',\'' + (d != null ? d.id : '') + '\');';
//                },
//            },
        '_tabs':{'label':'', 'type':'paneltabs', 'selected':'qsos', //'panelcolumn':1,
            'visible':function() { return M.size != 'compact' && M.qruqsp_fielddaylog_main.menu.uisize == 'normal' ? 'yes' : 'hidden'; },
            'tabs':{
                'qsos':{'label':'Contacts', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'qsos\');'},
//                'areas':{'label':'Sections', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'areas\');'},
                'vareas':{'label':'Sections', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'vareas\');'},
                'map':{'label':'Map', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'map\');'},
                'stats':{'label':'Stats', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'stats\');'},
                'usbandplan':{'label':'US', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'usbandplan\');'},
                'cdnbandplan':{'label':'Canada', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'cdnbandplan\');'},
            }},
//        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':1,
//            'visible':function() { return M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'qsos' ? 'yes' : 'hidden'; },
//            'cellClasses':[''],
//            'hint':'Search qso',
//            'noData':'No qso found',
//            },
        'recent':{'label':'Recent Contacts', 'type':'simplegrid', 'num_cols':6, //'panelcolumn':1,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'qsos' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'headerValues':['Date/Time', 'Call Sign', 'Class', 'Section', 'Band', 'Mode', 'Operator'],
            'headerClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', ''],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', ''],
            'noData':'No contacts',
            'addTxt':'Add Contact',
            'addFn':'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',0,null);',
            'rowFn':function(i, d) {
                return 'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',\'' + (d != null ? d.id : '') + '\');';
                },
            },
        'areas':{'label':'Sections', 'type':'simplegrid', 'num_cols':14, //'panelcolumn':2,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'areas' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'cellClasses':['alignright', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'vareas':{'label':'Sections', 'type':'simplegrid', 'num_cols':12, //'panelcolumn':2,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'vareas' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'headerValues':['DX','1','2','3','4','5','6','7','8','9','0','CA'],
            'headerClasses':['alignright', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['alignright', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'map':{'label':'Sections Worked Map', 'type':'imageform',
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'map' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'fields':{
                'map_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'size':'large', 'controls':'no', 'history':'no'},
            }},
        'map_credit':{'label':'', 'type':'html', 
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'map' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'html':'Map by <a href="https://www.mapability.com/ei8ic/maps/sections.php" target="_blank">EI8IC</a>. License: <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0</a>.',
            },
        'mode_band_stats':{'label':'Statistics', 'type':'simplegrid', 'num_cols':14,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'stats' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'cellClasses':['bold', ''],
            'sortable':'yes',
            'sortTypes':['text','number','number','number','number','number','number','number','number','number','number','number','number','number','number'],
            'headerValues':['Mode','160','80','40','20','15','10','6','2','220','70','SAT','Other','Totals'],
            'headerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'footerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'gota_stats':{'label':'GOTA', 'type':'simplegrid', 'num_cols':5,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'stats' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                && M.qruqsp_fielddaylog_main.menu.data.settings['category-operator'] != null 
                && M.qruqsp_fielddaylog_main.menu.data.settings['category-operator'] == 'MULTI-OP'
                ? 'yes' : 'hidden'; },
            'cellClasses':['bold', ''],
            'sortable':'yes',
            'sortTypes':['text','number','number','number','number','number','number','number','number','number','number','number','number','number','number'],
            'headerValues':['Operator','CW', 'Digital', 'Phone', 'Totals'],
            'headerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'footerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'section_band_stats':{'label':'', 'type':'simplegrid', 'num_cols':14,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'stats' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'cellClasses':['bold', ''],
            'sortable':'yes',
            'sortTypes':['text','number','number','number','number','number','number','number','number','number','number','number','number','number','number'],
            'headerValues':['Section','160','80','40','20','15','10','6','2','220','70','SAT','Other','Totals'],
            'headerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'footerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'usbandplan':{'label':'US Band Plan', 'type':'imageform',
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'usbandplan' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'fields':{
                'usbandplan_image_id':{'label':'', 'type':'image_id', 'dynamic':'no', 'hidelabel':'yes', 'size':'large', 'controls':'no', 'history':'no'},
            }},
        'cdnbandplan':{'label':'Canadian Band Plan', 'type':'imageform',
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'cdnbandplan' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'fields':{
                'cdnbandplan_image_id':{'label':'', 'type':'image_id', 'dynamic':'no', 'hidelabel':'yes', 'size':'large', 'controls':'no', 'history':'no'},
            }},
    }
    this.menu.imageURL = function(s, i, d, img_id) {
        //return '/qruqsp-mods/fielddaylog/ui/maps/base.jpg';
//        return M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID, 'sections':'ONN,NNY,CO,IA,WI,NM,MS,LA,AR'});
        if( s == 'cdnbandplan' ) {
            return '/qruqsp-mods/fielddaylog/ui/cdnbandplan.jpg';
        }
        if( s == 'usbandplan' ) {
            return '/qruqsp-mods/fielddaylog/ui/usbandplan.jpg';
        }
        return M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID});
    }
    this.menu.keyUp = function(e,s,i) {
        this.updateStorage();
        if( e.keyCode == 13 ) {
            this.addQSO();
            return false;
        } else {
            this.updateDups();
        }
        return true;
    }
    this.menu.clearForm = function(e,s,i) {
        this.refresh();
        this.show();
    }
    this.menu.updateDups = function() {
        this.updateStorage();
        this.liveSearchCb('qso', 'callsign', this.formValue('callsign'));
/*        M.api.getJSONBgCb('qruqsp.fielddaylog.dupSearch', {'tnid':M.curTenantID, 'callsign':this.formValue('callsign')}, function(rsp) {
            var p = M.qruqsp_fielddaylog_main.menu;
            if( M.size == 'compact' ) {
                p.data.compact_dups = rsp.duplicates;
            } else {
                p.data.duplicates = rsp.duplicates;
            }
            if( M.size == 'compact' ) {
                p.refreshSection('compact_dups');
            } else {
                p.refreshSection('duplicates');
            }
        }); */
    }
    this.menu.clearLiveSearches = function(s, f) {
        
    }
    this.menu.liveSearchCb = function(s, i, v) {
        if( s == 'qso' && v != '' ) {
            M.api.getJSONBgCb('qruqsp.fielddaylog.dupSearch', {'tnid':M.curTenantID, 'callsign':v, 'limit':'25'}, function(rsp) {
                M.qruqsp_fielddaylog_main.menu.liveSearchShow(s,i,M.gE(M.qruqsp_fielddaylog_main.menu.panelUID + '_' + i), rsp.duplicates);
                });
        }
    }
    this.menu.liveSearchResultValue = function(s, f, i, j, d) {
        
//        return d.callsign + ' ' + d['class'] + ' ' + d.section + ' ' + d.band + ' ' + d.mode;
        return this.cellValue(s, i, j, d);
    }
    this.menu.liveSearchResultClass = function(s, f, i, j, d) {
        if( d.callsign == this.formValue('callsign').toUpperCase() 
            && d.band == this.formValue('band').toUpperCase()
            && d.mode == this.formValue('mode').toUpperCase()
            ) {
            return 'multiline statusred';
        }
        return 'multiline';
    }
//    this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
//        return 'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',\'' + (d != null ? d.id : '') + '\');';
//    }
    this.menu.cellValue = function(s, i, j, d) {
        if( s == 'bookmarks' ) {
            switch(j) {
                case 0: return d.frequency;
                case 1: return d.callsign;
                case 2: return M.faBtn('&#xf1f8;', 'Delete', 'M.qruqsp_fielddaylog_main.menu.bookmarkDelete(\'' + i + '\');');
            }
        }
        if( s == 'scores' || s == 'mydetails' ) {
            switch(j) {
                case 0: return '<b>' + d.label + '</b>';
                case 1: return d.value;
            }
        }
        if( s == 'qso' || s == 'compact_dups' ) {
            switch(j) {
                case 0: return M.multiline(d.callsign, d.qso_dt_display);
                case 1: return M.multiline(d['class'], d.section);
                case 2: return M.multiline(d.band, d.mode);
            }
        }
        if( s == 'recent' || s == 'qsos' || s == 'search' || s == 'duplicates' ) {
            switch(j) {
                case 0: return d.qso_dt_display;
                case 1: return d.callsign;
                case 2: return d['class'];
                case 3: return d.section;
                case 4: return d.band;
                case 5: return d.mode;
                case 6: return d.operator;
            }
        }
        if( s == 'vareas' ) {
            return d[j].label;
        }
        if( s == 'areas' && j == 0 ) {
            return '<b>' + d.name + '</b>';
        } else if( s == 'areas' && j > 0 && d.sections[(j-1)] != null ) {
            return d.sections[(j-1)].label;
        }
        if( s == 'gota_stats' ) {
            switch(j) {
                case 0: return '<b>' + d.label + '</b>';
                case 1: return d.CW.num_qsos;
                case 2: return d.DIG.num_qsos;
                case 3: return d.PH.num_qsos;
                case 4: return d.totals.num_qsos;
            }
        }
        if( s == 'mode_band_stats' || s == 'section_band_stats' ) {
            switch(j) {
                case 0: return '<b>' + d.label + '</b>';
                case 1: return (d.label=='Totals'?'<b>'+d[160].num_qsos+'</b>':d[160].num_qsos);
                case 2: return (d.label=='Totals'?'<b>'+d[80].num_qsos+'</b>':d[80].num_qsos);
                case 3: return (d.label=='Totals'?'<b>'+d[40].num_qsos+'</b>':d[40].num_qsos);
                case 4: return (d.label=='Totals'?'<b>'+d[20].num_qsos+'</b>':d[20].num_qsos);
                case 5: return (d.label=='Totals'?'<b>'+d[15].num_qsos+'</b>':d[15].num_qsos);
                case 6: return (d.label=='Totals'?'<b>'+d[10].num_qsos+'</b>':d[10].num_qsos);
                case 7: return (d.label=='Totals'?'<b>'+d[6].num_qsos+'</b>':d[6].num_qsos);
                case 8: return (d.label=='Totals'?'<b>'+d[2].num_qsos+'</b>':d[2].num_qsos);
                case 9: return (d.label=='Totals'?'<b>'+d[220].num_qsos+'</b>':d[220].num_qsos);
                case 10: return (d.label=='Totals'?'<b>'+d[440].num_qsos+'</b>':d[440].num_qsos);
                case 11: return (d.label=='Totals'?'<b>'+d.satellite.num_qsos+'</b>':d.satellite.num_qsos);
//                case 12: return (d.label=='Totals'?'<b>'+d.gota.num_qsos+'</b>':d.gota.num_qsos);
                case 12: return (d.label=='Totals'?'<b>'+d.other.num_qsos+'</b>':d.other.num_qsos);
                case 13: return '<b>' + d.totals.num_qsos + '</b>';
            }
        }
    }
    this.menu.rowClass = function(s, i, d) {
        if( s == 'compact_dups' 
            && d.callsign == this.formValue('callsign').toUpperCase() 
            && d.band == this.formValue('band').toUpperCase()
            && d.mode == this.formValue('mode').toUpperCase()
            ) {
            return 'statusred';
        }
        if( s == 'duplicates' 
            && d.callsign == this.formValue('callsign').toUpperCase() 
            && d.band == this.formValue('band').toUpperCase()
            && d.mode == this.formValue('mode').toUpperCase()
            ) {
            return 'statusred';
        }
        if( s == 'recent' && d.freqbanderror != null ) {
            return 'statusorange';
        }
    }
    this.menu.cellClass = function(s, i, j, d) {
        if( (s == 'scores' || s == 'mydetails') && j == 0 ) {
            return 'statusgrey alignright';
        }
        if( s == 'areas' && j == 0 ) {
            return 'statusgrey aligncenter';
        }
        if( s == 'vareas' 
            && this.data.sections[d[j].label] != null
            && this.data.sections[d[j].label].num_qsos > 0
            ) {
            return 'statusgreen aligncenter';
        }
        if( s == 'areas' && j > 0 
            && d.sections[(j-1)] != null 
            && d.sections[(j-1)].label != null
            && this.data.sections[d.sections[(j-1)].label] != null
            && this.data.sections[d.sections[(j-1)].label].num_qsos > 0
            ) {
            return 'statusgreen aligncenter';
        }
        if( s == 'gota_stats' ) {
            if( i == 'totals' ) {
                return 'statusgrey aligncenter';
            }
        }
        if( s == 'mode_band_stats' || s == 'section_band_stats' ) {
            if( i == 'totals' ) {
                return 'statusgrey aligncenter';
            }
            switch (j) {
                case 1: return (d[160].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 2: return (d[80].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 3: return (d[40].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 4: return (d[20].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 5: return (d[15].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 6: return (d[10].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 7: return (d[6].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 8: return (d[2].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 9: return (d[220].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 10: return (d[440].num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 11: return (d.satellite.num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
//                case 12: return (d.gota.num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 12: return (d.other.num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 0: 
                case 13: return 'statusgrey aligncenter bold';
            }
        }
        if( this.sections[s].cellClasses != null ) {
            return this.sections[s].cellClasses[j];
        }
        return '';
    }
    this.menu.footerValue = function(s, i, sc) {
        if( s == 'gota_stats' ) {
            switch(i) {
                case 0: return this.data.totals[s].label;
                case 1: return this.data.totals[s]['CW'].num_qsos;
                case 2: return this.data.totals[s]['DIG'].num_qsos;
                case 3: return this.data.totals[s]['PH'].num_qsos;
                case 4: return this.data.totals[s].totals.num_qsos;
            }
        }
        if( s == 'mode_band_stats' || s == 'section_band_stats' ) {
            switch(i) {
                case 0: return this.data.totals[s].label;
                case 1: return this.data.totals[s][160].num_qsos;
                case 2: return this.data.totals[s][80].num_qsos;
                case 3: return this.data.totals[s][40].num_qsos;
                case 4: return this.data.totals[s][20].num_qsos;
                case 5: return this.data.totals[s][15].num_qsos;
                case 6: return this.data.totals[s][10].num_qsos;
                case 7: return this.data.totals[s][6].num_qsos;
                case 8: return this.data.totals[s][2].num_qsos;
                case 9: return this.data.totals[s][220].num_qsos;
                case 10: return this.data.totals[s][440].num_qsos;
                case 11: return this.data.totals[s].satellite.num_qsos;
//                case 12: return this.data.totals[s].gota.num_qsos;
                case 12: return this.data.totals[s].other.num_qsos;
                case 13: return this.data.totals[s].totals.num_qsos;
            }
        }
        return null;
    }
    this.menu.switchTab = function(t) {
        this.sections._tabs.selected = t;
        this.refreshSection('_tabs');
        this.showHideSections(['search', 'recent', 'areas', 'vareas', 'map', 'map_credit', 'gota_stats', 'mode_band_stats', 'section_band_stats', 'usbandplan', 'cdnbandplan']);
        this.refreshMap();
    }
/*    this.menu.expandUI = function() {
        if( this.uisize == 'large' ) {
            this.uisize = 'normal';
        } else {
            this.uisize = 'large';
        }
        this.reopen();
    } */
    this.menu.refreshMap = function() {
        var url = M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID}) + '&t=' + new Date().getTime();
        var e = M.gE(this.panelUID + '_map_image_id_preview').firstChild;
        e.src = url;
    }
    this.menu.openMonitor = function() {
        M.qruqsp_fielddaylog_main.monitor.open('M.qruqsp_fielddaylog_main.menu.reopen();');
    }
    this.menu.downloadADIF = function() {
        M.api.openFile('qruqsp.fielddaylog.exportADIF', {'tnid':M.curTenantID});
    }
    this.menu.downloadCabrillo = function() {
        // Check settings to make sure they've filled in
        if( this.data.settings == null 
            || this.data.settings.callsign == null || this.data.settings.callsign == ''
            || this.data.settings['class'] == null || this.data.settings['class'] == ''
            || this.data.settings['section'] == null || this.data.settings['section'] == ''
            || this.data.settings['category-operator'] == null || this.data.settings['category-operator'] == ''
            || this.data.settings['category-assisted'] == null || this.data.settings['category-assisted'] == ''
            || this.data.settings['category-power'] == null || this.data.settings['category-power'] == ''
            || this.data.settings['category-station'] == null || this.data.settings['category-station'] == ''
            || this.data.settings['category-transmitter'] == null || this.data.settings['category-transmitter'] == ''
            ) {
            M.alert('Before you can download Cabrillo file you must click on Settings in the top right and configure your station.');
        } else {
            M.api.openFile('qruqsp.fielddaylog.exportCabrillo', {'tnid':M.curTenantID});
        }
    }
    this.menu.downloadExcel = function() {
        M.api.openFile('qruqsp.fielddaylog.exportExcel', {'tnid':M.curTenantID});
    }
    this.menu.reopen = function(cb) {
        M.api.getJSONCb('qruqsp.fielddaylog.get', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.menu;
            p.sections._notes.visible = 'hidden';
            if( M.size != 'compact' && rsp.settings != null && rsp.settings['ui-notes'] != null && rsp.settings['ui-notes'] == 'yes' ) {
                p.sections._notes.visible = 'yes';
            }
            var e = M.gE(p.panelUID + '_operator');
            var flags1 = M.gE(p.panelUID + '_flags1');
            p.sections.recent.num_cols = 6;
            if( e != null && e.parentNode != null && e.parentNode.parentNode != null ) {
                if( rsp.settings != null && rsp.settings['category-operator'] != null && rsp.settings['category-operator'] == 'MULTI-OP' ) {
                    p.sections.recent.num_cols = 7;
                    flags1.parentNode.parentNode.style.display = 'table-row';
                    e.parentNode.parentNode.style.display = 'table-row';
                } else {
                    flags1.parentNode.parentNode.style.display = 'none';
                    e.parentNode.parentNode.style.display = 'none';
                }
            }
            p.data.scores = rsp.scores;
            p.data.mydetails = rsp.mydetails;
//            p.data.qsos = rsp.qsos;
            p.data.recent = rsp.recent;
            p.data.areas = rsp.areas;
            p.data.vareas = rsp.vareas;
            p.data.sections = rsp.sections;
            p.data.map_sections = rsp.map_sections;
            p.data.stats = rsp.stats;
            p.data.settings = rsp.settings;
            p.showHideSections(['_tabs']);
            p.refreshSections(['compact_dups', 'duplicates','scores', 'mydetails', 'recent','areas','vareas','gota_stats', 'mode_band_stats', 'section_band_stats', 'usbandplan', 'cdnbandplan']); 
            p.showHideSections(['_notes', 'recent', 'areas', 'vareas', 'map', 'map_credit', 'gota_stats', 'mode_band_stats', 'section_band_stats', 'usbandplan', 'cdnbandplan']);
            p.show();
            p.refreshMap();
            });
    }
    this.menu.open = function(cb) {
        M.api.getJSONCb('qruqsp.fielddaylog.get', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.menu;
            p.data = rsp;
            p.data.map_image_id = 1;  // Needs to be > 0 for core code to work
            p.data.usbandplan_image_id = 1;  // Needs to be > 0 for core code to work
            p.data.cdnbandplan_image_id = 1;  // Needs to be > 0 for core code to work
            p.sections._notes.visible = 'hidden';
            if( M.size != 'compact' && rsp.settings != null && rsp.settings['ui-notes'] != null && rsp.settings['ui-notes'] == 'yes' ) {
                p.sections._notes.visible = 'yes';
            }
            p.sections.qso.fields.flags1.visible = 'no';
            p.sections.qso.fields.operator.visible = 'no';
            p.sections.recent.num_cols = 6;
            if( rsp.settings != null && rsp.settings['category-operator'] != null && rsp.settings['category-operator'] == 'MULTI-OP' ) {
                p.sections.qso.fields.flags1.visible = 'yes';
                p.sections.qso.fields.operator.visible = 'yes';
                p.sections.recent.num_cols = 7;
            }
            if( M.modFlagOn('qruqsp.fielddaylog', 0x10) && localStorage != null ) {
                p.data.bookmarks = localStorage.getItem("qruqsp.fielddaylog.bookmarks")
                if( p.data.bookmarks != null && p.data.bookmarks != '' ) {
                    p.data.bookmarks = JSON.parse(p.data.bookmarks);
                }
            } else {
                p.data.bookmarks = null;
            }
            if( localStorage != null ) {
                if( localStorage.getItem('qruqsp.fielddaylog.frequency') != null ) {
                    p.data.frequency = localStorage.getItem('qruqsp.fielddaylog.frequency');
                }
                if( localStorage.getItem('qruqsp.fielddaylog.band') != null ) {
                    p.data.band = localStorage.getItem('qruqsp.fielddaylog.band');
                }
                if( localStorage.getItem('qruqsp.fielddaylog.mode') != null ) {
                    p.data.mode = localStorage.getItem('qruqsp.fielddaylog.mode');
                }
                if( localStorage.getItem('qruqsp.fielddaylog.operator') != null ) {
                    p.data.operator = localStorage.getItem('qruqsp.fielddaylog.operator');
                }
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.menu.updateStorage = function() {
        if( localStorage != null ) {
            localStorage.setItem('qruqsp.fielddaylog.band', this.formValue('band'));
            localStorage.setItem('qruqsp.fielddaylog.mode', this.formValue('mode'));
            localStorage.setItem('qruqsp.fielddaylog.frequency', this.formValue('frequency'));
            localStorage.setItem('qruqsp.fielddaylog.operator', this.formValue('operator'));
        }
    }
    this.menu.addQSO = function() {
        var c = this.serializeForm('yes');
        M.api.postJSONCb('qruqsp.fielddaylog.qsoAdd', {'tnid':M.curTenantID}, c, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.menu;
            p.data = rsp;
            p.data.map_image_id = 1;  // Needs to be > 0 for core code to work
            p.data.usbandplan_image_id = 1;  // Needs to be > 0 for core code to work
            p.data.cdnbandplan_image_id = 1;  // Needs to be > 0 for core code to work
            var callsign = p.formFieldValue('callsign');
            var frequency = p.formFieldValue('frequency');
            p.setFieldValue('callsign', '');
            p.setFieldValue('class', '');
            p.setFieldValue('section', '');
            p.refreshSections(['compact_dups', 'duplicates','scores', 'mydetails', 'recent','areas','vareas','gota_stats', 'mode_band_stats', 'section_band_stats', 'usbandplan', 'cdnbandplan']);
            p.refreshMap();
            M.gE(p.panelUID + '_callsign').focus();
            if( M.modFlagOn('qruqsp.fielddaylog', 0x10) && localStorage != null ) {
                var bookmarks = localStorage.getItem("qruqsp.fielddaylog.bookmarks")
                if( bookmarks != null && bookmarks != '' ) {
                    bookmarks = JSON.parse(bookmarks);
                    for(var i in bookmarks) {
                        if( bookmarks[i].callsign == callsign && bookmarks[i].frequency == frequency ) {
                            bookmarks.splice(i, 1);
                        }
                    }
                }
                p.refreshSection('bookmarks');
            }
        });
    }
    this.menu.bookmarkAdd = function() {
        if( localStorage != null ) {
            var bookmarks = localStorage.getItem("qruqsp.fielddaylog.bookmarks");
            if( bookmarks == null || bookmarks == '' ) {
                var bookmarks = [];
            } else {
                var bookmarks = JSON.parse(localStorage.getItem("qruqsp.fielddaylog.bookmarks"));
            }
            // Check if callsign or frequency already exists
            for(var i in bookmarks) {
                if( bookmarks[i] != null 
                    && bookmarks[i].callsign == this.formValue('callsign')
                    && bookmarks[i].frequency == this.formValue('frequency')
                    ) {
                    this.open();
                    return true;
                }
            }
            bookmarks.unshift({
                'callsign':this.formValue('callsign'),
                'class':this.formValue('class'),
                'section':this.formValue('section'),
                'frequency':this.formValue('frequency'),
                'band':this.formValue('band'),
                'mode':this.formValue('mode'),
                });
            localStorage.setItem("qruqsp.fielddaylog.bookmarks", JSON.stringify(bookmarks));
            this.open();
        }
    }
    this.menu.bookmarkOpen = function(i) {
        var bookmarks = JSON.parse(localStorage.getItem("qruqsp.fielddaylog.bookmarks"));
        if( bookmarks[i] != null ) {
            this.setFieldValue('callsign', bookmarks[i].callsign);
            this.setFieldValue('class', bookmarks[i].class);
            this.setFieldValue('section', bookmarks[i].section);
            this.setFieldValue('frequency', bookmarks[i].frequency);
            this.setFieldValue('band', bookmarks[i].band);
            this.setFieldValue('mode', bookmarks[i].mode);
        }
    }
    this.menu.bookmarkDelete = function(i) {
        var bookmarks = JSON.parse(localStorage.getItem("qruqsp.fielddaylog.bookmarks"));
        if( bookmarks[i] != null ) {
            bookmarks.splice(i, 1);
            localStorage.setItem("qruqsp.fielddaylog.bookmarks", JSON.stringify(bookmarks));
        }
        this.open();
    }
    this.menu.addClose('Back');
    this.menu.addLeftButton('cancel', 'Clear', 'M.qruqsp_fielddaylog_main.menu.open();');

    //
    // The panel to list all the qso
    //
    this.qsos = new M.panel('Contact', 'qruqsp_fielddaylog_main', 'qsos', 'mc', 'large', 'sectioned', 'qruqsp.fielddaylog.main.qsos');
    this.qsos.data = {};
    this.qsos.nplist = [];
    this.qsos.sections = {
        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':6,
            'headerValues':['Date/Time', 'Call Sign', 'Class', 'Section', 'Band', 'Mode', 'Operator', 'Notes'],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', '', ''],
            'hint':'Search call signs',
            'noData':'No call signs found',
            },
        'qsos':{'label':'All Contacts', 'type':'simplegrid', 'num_cols':6, 
            'headerValues':['Date/Time', 'Call Sign', 'Class', 'Section', 'Band', 'Mode', 'Operator', 'Notes'],
//
//          Sorting on a large list (+1000) will stall browser for multiple minutes, not good!
//            'sortable':'yes',
//            'sortTypes':['date', 'text', 'text', 'text', 'number', 'text'],
            'headerClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', '', ''],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', '', ''],
            'noData':'No contacts',
            'addTxt':'Add Contact',
            'addFn':'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.qsos.open();\',0,null);'
            },
    }
    this.qsos.liveSearchCb = function(s, i, v) {
        if( s == 'search' && v != '' ) {
            M.api.getJSONBgCb('qruqsp.fielddaylog.qsoSearch', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'25'}, function(rsp) {
                M.qruqsp_fielddaylog_main.qsos.liveSearchShow('search',null,M.gE(M.qruqsp_fielddaylog_main.qsos.panelUID + '_' + s), rsp.qsos);
                });
        }
    }
    this.qsos.liveSearchResultValue = function(s, f, i, j, d) {
        return this.cellValue(s, i, j, d);
    }
    this.qsos.liveSearchResultRowFn = function(s, f, i, j, d) {
        return this.rowFn(s, i, d);
    }
    this.qsos.cellValue = function(s, i, j, d) {
        if( s == 'qsos' || s == 'search' ) {
            switch(j) {
                case 0: return d.qso_dt_display;
                case 1: return d.callsign;
                case 2: return d['class'];
                case 3: return d.section;
                case 4: return d.band;
                case 5: return d.mode;
                case 6: return d.operator;
                case 7: return d.notes;
            }
        }
    }
    this.qsos.rowClass = function(s, i, d) {
        if( s == 'qsos' && d.freqbanderror != null ) {
            return 'statusorange';
        }
    }
    this.qsos.rowFn = function(s, i, d) {
        if( s == 'qsos' || s == 'search' ) {
            return 'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.qsos.open();\',\'' + d.id + '\',M.qruqsp_fielddaylog_main.qso.nplist);';
        }
    }
    this.qsos.open = function(cb) {
        M.api.getJSONCb('qruqsp.fielddaylog.qsoList', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.qsos;
            p.data = rsp;
            p.sections.search.livesearchcols = 6;
            p.sections.qsos.num_cols = 6;
            if( rsp.settings != null && rsp.settings['category-operator'] != null && rsp.settings['category-operator'] == 'MULTI-OP' ) {
                if( rsp.settings['ui-notes'] != null && rsp.settings['ui-notes'] == 'yes' ) {
                    p.sections.search.livesearchcols = 8;
                    p.sections.qsos.num_cols = 8;
                } else {
                    p.sections.search.livesearchcols = 7;
                    p.sections.qsos.num_cols = 7;
                }
            }
            p.nplist = (rsp.nplist != null ? rsp.nplist : null);
            p.refresh();
            p.show(cb);
        });
    }
    this.qsos.addClose('Back');

    //
    // The panel to edit QSO
    //
    this.qso = new M.panel('Contact', 'qruqsp_fielddaylog_main', 'qso', 'mc', 'medium', 'sectioned', 'qruqsp.fielddaylog.main.qso');
    this.qso.data = null;
    this.qso.qso_id = 0;
    this.qso.nplist = [];
    this.qso.sections = {
        'general':{'label':'', 'fields':{
            'qso_dt':{'label':'UTC of QSO', 'type':'text', 'required':'yes'},
            'callsign':{'label':'Call Sign', 'required':'yes', 'type':'text'},
            'class':{'label':'Class', 'required':'yes', 'type':'text'},
            'section':{'label':'Section', 'required':'yes', 'type':'text'},
            'frequency':{'label':'Frequency', 'type':'text'},
            'band':{'label':'Band', 'type':'select', 'options':this.bandOptions},
            'mode':{'label':'Mode', 'type':'toggle', 'toggles':{'CW':'CW', 'PH':'PH', 'DIG':'DIG'}},
            'flags1':{'label':'GOTA', 'type':'flagtoggle', 'default':'off', 'bit':0x01, 'field':'flags', 'visible':'no'},
            'operator':{'label':'Operator', 'type':'text', 'visible':'no'},
            }},
        '_notes':{'label':'Notes', 'visible':'no', 'fields':{
            'notes':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'large'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.qruqsp_fielddaylog_main.qso.save();'},
            'delete':{'label':'Delete', 
                'visible':function() {return M.qruqsp_fielddaylog_main.qso.qso_id > 0 ? 'yes' : 'no'; },
                'fn':'M.qruqsp_fielddaylog_main.qso.remove();'},
            }},
        };
    this.qso.fieldValue = function(s, i, d) { return this.data[i]; }
    this.qso.fieldHistoryArgs = function(s, i) {
        return {'method':'qruqsp.fielddaylog.qsoHistory', 'args':{'tnid':M.curTenantID, 'qso_id':this.qso_id, 'field':i}};
    }
    this.qso.open = function(cb, qid, list) {
        if( qid != null ) { this.qso_id = qid; }
        if( list != null ) { this.nplist = list; }
        M.api.getJSONCb('qruqsp.fielddaylog.qsoGet', {'tnid':M.curTenantID, 'qso_id':this.qso_id}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.qso;
            p.data = rsp.qso;
            p.sections._notes.visible = 'no';
            if( rsp.settings != null && rsp.settings['ui-notes'] != null && rsp.settings['ui-notes'] == 'yes' ) {
                p.sections._notes.visible = 'yes';
            }
            p.sections.general.fields.flags1.visible = 'no';
            p.sections.general.fields.operator.visible = 'no';
            if( rsp.settings != null && rsp.settings['category-operator'] != null && rsp.settings['category-operator'] == 'MULTI-OP' ) {
                p.sections.general.fields.flags1.visible = 'yes';
                p.sections.general.fields.operator.visible = 'yes';
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.qso.save = function(cb) {
        if( cb == null ) { cb = 'M.qruqsp_fielddaylog_main.qso.close();'; }
        if( !this.checkForm() ) { return false; }
        if( this.qso_id > 0 ) {
            var c = this.serializeForm('no');
            if( c != '' ) {
                M.api.postJSONCb('qruqsp.fielddaylog.qsoUpdate', {'tnid':M.curTenantID, 'qso_id':this.qso_id}, c, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
                    eval(cb);
                });
            } else {
                eval(cb);
            }
        } else {
            var c = this.serializeForm('yes');
            M.api.postJSONCb('qruqsp.fielddaylog.qsoAdd', {'tnid':M.curTenantID}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.qruqsp_fielddaylog_main.qso.qso_id = rsp.id;
                eval(cb);
            });
        }
    }
    this.qso.remove = function() {
        M.confirm('Are you sure you want to remove qso?',null,function() {
            M.api.getJSONCb('qruqsp.fielddaylog.qsoDelete', {'tnid':M.curTenantID, 'qso_id':M.qruqsp_fielddaylog_main.qso.qso_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.qruqsp_fielddaylog_main.qso.close();
            });
        });
    }
    this.qso.nextButtonFn = function() {
        if( this.nplist != null && this.nplist.indexOf('' + this.qso_id) < (this.nplist.length - 1) ) {
            return 'M.qruqsp_fielddaylog_main.qso.save(\'M.qruqsp_fielddaylog_main.qso.open(null,' + this.nplist[this.nplist.indexOf('' + this.qso_id) + 1] + ');\');';
        }
        return null;
    }
    this.qso.prevButtonFn = function() {
        if( this.nplist != null && this.nplist.indexOf('' + this.qso_id) > 0 ) {
            return 'M.qruqsp_fielddaylog_main.qso.save(\'M.qruqsp_fielddaylog_main.qso.open(null,' + this.nplist[this.nplist.indexOf('' + this.qso_id) - 1] + ');\');';
        }
        return null;
    }
    this.qso.addButton('save', 'Save', 'M.qruqsp_fielddaylog_main.qso.save();');
    this.qso.addClose('Cancel');
    this.qso.addButton('next', 'Next');
    this.qso.addLeftButton('prev', 'Prev');

    //
    // The settings panel
    //
    this.settings = new M.panel('Settings', 'qruqsp_fielddaylog_main', 'settings', 'mc', 'large narrowaside', 'sectioned', 'qruqsp.fielddaylog.main.settings');
    this.settings.data = null;
    this.settings.settings_id = 0;
    this.settings.nplist = [];
    this.settings.sections = {
        '_station':{'label':'Station Call Sign', 'aside':'yes', 'fields':{
            'callsign':{'label':'Call Sign', 'type':'text'},
            'class':{'label':'Class', 'type':'text'},
            'section':{'label':'Section', 'type':'text'},
            }},
        '_ui':{'label':'Options', 'aside':'yes', 'fields':{
            'ui-notes':{'label':'Use notes', 'type':'toggle', 'default':'no', 'toggles':{'no':'No', 'yes':'Yes'}},
            'allow-dupes':{'label':'Allow Duplicate QSOs', 'type':'toggle', 'default':'yes', 'toggles':{'no':'No', 'yes':'Yes'}},
            }},
        '_bonus':{'label':'Bonus Points', 'fields':{
            'bonus-emergency-power':{'label':'100% Emergency Power (7.3.1)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only Classes (A, B, C, E and F)',
                },
            'bonus-media-publicity':{'label':'Media Publicity (7.3.2)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All Classes',
                },
            'bonus-public-location':{'label':'Public Location (7.3.3)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only classes (A, B and F)',
                },
            'bonus-public-information':{'label':'Public Information Table (7.3.4)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only classes (A, B and F)',
                },
            'bonus-message-sent':{'label':'Message to Section Manager (7.3.5)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-messages-sent':{'label':'Number Messages Sent (7.3.6)', 'type':'toggle', 'default':'0', 
                'toggles':{'0':'0', '1':'1', '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7', '8':'8', '9':'9', '10':'10'}, 'hint':'All classes',
                },
            'bonus-satellite-qso':{'label':'Satellite QSO (7.3.7)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only classes (A, B and F)',
                },
            'bonus-alternate-power':{'label':'Alternate Power (7.3.8)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only classes (A, B, E and F)',
                },
            'bonus-w1aw-bulletin':{'label':'Copied W1AW Bulletin (7.3.9)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-education-activity':{'label':'Education Activity (7.3.10)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only classes (A, D, E and F)',
                },
            'bonus-visit-gov':{'label':'Elected Government Official Visit (7.3.11)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-visit-agency':{'label':'Agency Official Visit (7.3.12)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-gota':{'label':'GOTA Bonus Points (7.3.13)', 'type':'text', 'default':'', 
                'hint':'Max 1000 points',
                },
            'bonus-web-submit':{'label':'Submit Via Website (7.3.14)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-youth-participation':{'label':'Youth Participation Points (7.3.15)', 'type':'text', 'default':'', 
                'hint':'Max 100 points',
                },
            'bonus-social-media':{'label':'Social Media Promotion (7.3.16)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'All classes',
                },
            'bonus-safety-officer':{'label':'Safety Officer (7.3.17)', 'type':'toggle', 'default':'no', 
                'toggles':{'no':'No', 'yes':'Yes'}, 'hint':'Only class (A)',
                },
            }},
        '_logging':{'label':'Cabrillo Export Details', 'fields':{
            'category-operator':{'label':'Operator', 'type':'toggle', 'default':'SINGLE-OP', 'toggles':{'SINGLE-OP':'Single Operator', 'MULTI-OP':'Multi-Operator'}},
            'category-assisted':{'label':'Assisted', 'type':'toggle', 'default':'ASSISTED', 'toggles':{'ASSISTED':'Assisted', 'NON-ASSISTED':'Non-Assisted'}},
            'category-power':{'label':'Power', 'type':'toggle', 'default':'LOW', 'toggles':{'QRP-BATTERY':'QRP-Battery', 'QRP':'QRP', 'LOW':'Low < 100w', 'HIGH':'High'}},
            'category-station':{'label':'Station', 'type':'toggle', 'default':'FIXED', 'toggles':{'FIXED':'Fixed', 
                'MOBILE':'Mobile', 
                'PORTABLE':'Portable', 
                'ROVER':'Rover', 
                'ROVER-LIMITED':'Rover-Limited', 
                'ROVER-UNLIMITED':'Rover-Unlimited', 
                }},
            'category-transmitter':{'label':'Transmitter', 'type':'toggle', 'default':'ONE', 'toggles':{
                'ONE':'One',
                'TWO':'Two',
                'LIMITED':'Limited',
                'UNLIMITED':'Unlimited',
                'SWL':'SWL',
                }},
            'name':{'label':'Name', 'type':'text'},
            'address':{'label':'Address', 'type':'text'},
            'city':{'label':'City', 'type':'text'},
            'state':{'label':'State/Province', 'type':'text'},
            'postal':{'label':'ZIP/Postal Code', 'type':'text'},
            'country':{'label':'Country', 'type':'text'},
            'club':{'label':'Club', 'type':'text'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.qruqsp_fielddaylog_main.settings.save();'},
            'clear':{'label':'Clear Contacts', 'fn':'M.qruqsp_fielddaylog_main.settings.clearQSOs();'},
            }},
        };
    this.settings.fieldValue = function(s, i, d) { return this.data[i]; }
    this.settings.fieldHistoryArgs = function(s, i) {
        return {'method':'qruqsp.fielddaylog.settingsHistory', 'args':{'tnid':M.curTenantID, 'setting':i}};
    }
    this.settings.clearQSOs = function() {
        M.confirm("Are you sure you want to permanently delete all contacts? This is only advised during testing. Once deleted there is no way to recover the contacts.",null,function() {
            M.confirm("Are you really sure you want to delete all contacts?","Yes, Delete Contacts",function() {
                M.api.getJSONCb('qruqsp.fielddaylog.qsosDelete', {'tnid':M.curTenantID}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
                    M.alert('All contacts have been deleted.');
                });
            });
        });
    }
    this.settings.open = function(cb) {
        M.api.getJSONCb('qruqsp.fielddaylog.settingsGet', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.settings;
            p.data = rsp.settings;
            p.refresh();
            p.show(cb);
        });
    }
    this.settings.save = function(cb) {
        if( cb == null ) { cb = 'M.qruqsp_fielddaylog_main.settings.close();'; }
        if( !this.checkForm() ) { return false; }
        var c = this.serializeForm('no');
        if( c != '' ) {
            M.api.postJSONCb('qruqsp.fielddaylog.settingsUpdate', {'tnid':M.curTenantID}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                eval(cb);
            });
        } else {
            eval(cb);
        }
    }
    this.settings.addButton('save', 'Save', 'M.qruqsp_fielddaylog_main.settings.save();');
    this.settings.addClose('Cancel');

    //
    // The panel to list the qso
    //
    this.monitor = new M.panel('Dashboard', 'qruqsp_fielddaylog_main', 'monitor', 'mc', 'xlarge columns', 'sectioned', 'qruqsp.fielddaylog.main.monitor');
    this.monitor.data = {};
    this.monitor.nplist = [];
    this.monitor.uisize = 'normal';
    this.monitor.timeout = null;
    this.monitor.sections = {
        'recent':{'label':'Recent Contacts', 'type':'simplegrid', 'num_cols':6, //'panelcolumn':1,
            'panelcolumn':1,
            'aside':'yes',
            'headerValues':['Date/Time', 'Call Sign', 'Class', 'Section', 'Band', 'Mode', 'Operator'],
            'headerClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', ''],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', ''],
            'noData':'No contacts',
            'limit':7,
            },
        'vareas':{'label':'Sections', 'type':'simplegrid', 'num_cols':12, //'panelcolumn':2,
            'panelcolumn':1,
            'aside':'yes',
            'headerValues':['DX','1','2','3','4','5','6','7','8','9','0','CA'],
            'headerClasses':['alignright', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['alignright', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'map':{'label':'Sections Worked Map', 'type':'imageform',
            'panelcolumn':2,
            'fields':{
                'map_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'size':'large', 'controls':'no', 'history':'no'},
            }},
        'map_credit':{'label':'', 'type':'html', 
            'panelcolumn':2,
            'html':'Map by <a href="https://www.mapability.com/ei8ic/maps/sections.php" target="_blank">EI8IC</a>. License: <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0</a>.',
            },
    }
    this.monitor.imageURL = function(s, i, d, img_id) {
        if( s == 'cdnbandplan' ) {
            return '/qruqsp-mods/fielddaylog/ui/cdnbandplan.jpg';
        }
        if( s == 'usbandplan' ) {
            return '/qruqsp-mods/fielddaylog/ui/usbandplan.jpg';
        }
        return M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID});
    }
    this.monitor.cellValue = function(s, i, j, d) {
        if( s == 'scores' || s == 'mydetails' ) {
            switch(j) {
                case 0: return '<b>' + d.label + '</b>';
                case 1: return d.value;
            }
        }
        if( s == 'qso' || s == 'compact_dups' ) {
            switch(j) {
                case 0: return M.multiline(d.callsign, d.qso_dt_display);
                case 1: return M.multiline(d['class'], d.section);
                case 2: return M.multiline(d.band, d.mode);
            }
        }
        if( s == 'recent' || s == 'qsos' || s == 'search' || s == 'duplicates' ) {
            switch(j) {
                case 0: return d.qso_dt_display;
                case 1: return d.callsign;
                case 2: return d['class'];
                case 3: return d.section;
                case 4: return d.band;
                case 5: return d.mode;
                case 6: return d.operator;
            }
        }
        if( s == 'vareas' ) {
            return d[j].label;
        }
        if( s == 'areas' && j == 0 ) {
            return '<b>' + d.name + '</b>';
        } else if( s == 'areas' && j > 0 && d.sections[(j-1)] != null ) {
            return d.sections[(j-1)].label;
        }
    }
    this.monitor.cellClass = function(s, i, j, d) {
        if( (s == 'scores' || s == 'mydetails') && j == 0 ) {
            return 'statusgrey alignright';
        }
        if( s == 'areas' && j == 0 ) {
            return 'statusgrey aligncenter';
        }
        if( s == 'vareas' 
            && this.data.sections[d[j].label] != null
            && this.data.sections[d[j].label].num_qsos > 0
            ) {
            return 'statusgreen aligncenter';
        }
        if( s == 'areas' && j > 0 
            && d.sections[(j-1)] != null 
            && d.sections[(j-1)].label != null
            && this.data.sections[d.sections[(j-1)].label] != null
            && this.data.sections[d.sections[(j-1)].label].num_qsos > 0
            ) {
            return 'statusgreen aligncenter';
        }
        if( this.sections[s].cellClasses != null ) {
            return this.sections[s].cellClasses[j];
        }
        return '';
    }
    this.monitor.refreshMap = function() {
        var url = M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID}) + '&t=' + new Date().getTime();
        var e = M.gE(this.panelUID + '_map_image_id_preview').firstChild;
        e.src = url;
    }
    this.monitor.reopen = function(cb) {
        M.api.getJSONBgCb('qruqsp.fielddaylog.get', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.monitor;
            
            if( p.data.recent[0] != null && rsp.recent[0] != null && rsp.recent[0].id != p.data.recent[0].id ) {
                console.log('diff');
                p.data = rsp;
                //p.refreshSections(['recent','vareas']); 
                //p.refreshMap(); 
                p.refreshSections(['recent', 'vareas']);
                p.refreshMap(); 
            }
            p.timeout = setTimeout(M.qruqsp_fielddaylog_main.monitor.reopen, (60*1000));
            });
    }
    this.monitor.open = function(cb) {
        if( this.timeout != null ) {
            clearTimeout(this.timeout);
        }
        M.api.getJSONCb('qruqsp.fielddaylog.get', {'tnid':M.curTenantID}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.qruqsp_fielddaylog_main.monitor;
            p.data = rsp;
            p.data.map_image_id = 1;  // Needs to be > 0 for core code to work
            p.sections.recent.num_cols = 6;
            if( rsp.settings != null && rsp.settings['category-operator'] != null && rsp.settings['category-operator'] == 'MULTI-OP' ) {
                p.sections.recent.num_cols = 7;
            }
            p.refresh();
            p.show(cb);
            p.timeout = setTimeout(M.qruqsp_fielddaylog_main.monitor.reopen, (60*1000));
        });
    }
    this.monitor.addClose('Back');

    //
    // Start the app
    // cb - The callback to run when the user leaves the main panel in the app.
    // ap - The application prefix.
    // ag - The app arguments.
    //
    this.start = function(cb, ap, ag) {
        args = {};
        if( ag != null ) {
            args = eval(ag);
        }
        this._settings = M.curTenant.modules['qruqsp.fielddaylog'].settings;
       
        this.menu.addButton('settings', 'Settings', 'M.qruqsp_fielddaylog_main.settings.open(\'M.qruqsp_fielddaylog_main.menu.reopen();\');');
        if( M.size == 'compact' ) {
            this.menu.sections.qso.label = '';
        } else {
//            this.menu.addButton('expand', 'Expand', 'M.qruqsp_fielddaylog_main.menu.expandUI();');
        }

        //
        // Create the app container
        //
        var ac = M.createContainer(ap, 'qruqsp_fielddaylog_main', 'yes');
        if( ac == null ) {
            M.alert('App Error');
            return false;
        }

        if( args.settings != null && args.settings == 'yes' ) {
            this.settings.open(cb);
        } else {
            this.menu.open(cb);
        }
    }
}
