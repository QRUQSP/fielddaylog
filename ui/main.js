//
// This is the main app for the fielddaylog module
//
function qruqsp_fielddaylog_main() {
    //
    // The panel to list the qso
    //
    this.menu = new M.panel('Field Day Logger', 'qruqsp_fielddaylog_main', 'menu', 'mc', 'xlarge narrowaside', 'sectioned', 'qruqsp.fielddaylog.main.menu');
    this.menu.data = {};
    this.menu.nplist = [];
    this.menu.uisize = 'normal';
    this.menu.sections = {
        'qso':{'label':'Contact', 'aside':'yes', 'fields':{
            'callsign':{'label':'Callsign', 'type':'text', 'autofocus':'yes',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            'class':{'label':'Class', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            'section':{'label':'Section', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            //'band':{'label':'Band', 'type':'text'},
            'band':{'label':'Band', 'type':'select', 
                'onchange':'M.qruqsp_fielddaylog_main.menu.updateDups',
                'options':{
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
                    'gota':'GOTA', 
                }},
            //'mode':{'label':'Mode', 'type':'text'},
            'mode':{'label':'Mode', 'type':'toggle', 
                'onchange':'M.qruqsp_fielddaylog_main.menu.updateDups',
                'toggles':{'CW':'CW', 'PH':'PH', 'DIG':'DIG'},
                },
            'frequency':{'label':'Frequency', 'type':'text',
                'onkeyup':'M.qruqsp_fielddaylog_main.menu.keyUp',
                },
            }},
        '_notes':{'label':'Notes', 'visible':'hidden', 'aside':'yes', 'fields':{
            'notes':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'small'},
            }},
        'compact_dups':{'label':'', 'type':'simplegrid', 'num_cols':3,
            'visible':function() { return M.size == 'compact' ? 'yes' : 'no'; },
            'cellClasses':['multiline', 'multiline', 'multiline'],
            },
        '_add':{'label':'', 'aside':'yes', 'buttons':{
            'add':{'label':'Add Contact', 'fn':'M.qruqsp_fielddaylog_main.menu.addQSO();'},
            }},
        'mydetails':{'label':'My Details', 'type':'simplegrid', 'num_cols':2, 'aside':'yes',
            'visible':function() { return M.size != 'compact' ? 'yes' : 'no'; },
            'cellClasses':['bold',''],
            },
        'scores':{'label':'', 'type':'simplegrid', 'num_cols':2, 'aside':'yes',
            'cellClasses':['bold',''],
            },
        '_buttons':{'label':'', 'aside':'yes', 'buttons':{
            'all':{'label':'Contact List', 'fn':'M.qruqsp_fielddaylog_main.qsos.open(\'M.qruqsp_fielddaylog_main.menu.open();\');'},
            'export':{'label':'Download Cabrillo', 'fn':'M.qruqsp_fielddaylog_main.menu.downloadCabrillo();'},
            }},
        'duplicates':{'label':'Duplicates', 'type':'simplegrid', 'num_cols':6, //'panelcolumn':1,
            'visible':function() { return M.size != 'compact' ? 'yes' : 'no'; },
            'headerValues':['Date/Time', 'Callsign', 'Class', 'Section', 'Band', 'Mode'],
            'noData':'No duplicates found',
            },
        '_tabs':{'label':'', 'type':'paneltabs', 'selected':'qsos', //'panelcolumn':1,
            'visible':function() { return M.size != 'compact' && M.qruqsp_fielddaylog_main.menu.uisize == 'normal' ? 'yes' : 'hidden'; },
            'tabs':{
                'qsos':{'label':'Contacts', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'qsos\');'},
//                'areas':{'label':'Sections', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'areas\');'},
                'vareas':{'label':'Sections', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'vareas\');'},
                'map':{'label':'Map', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'map\');'},
                'stats':{'label':'Stats', 'fn':'M.qruqsp_fielddaylog_main.menu.switchTab(\'stats\');'},
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
            'headerValues':['Date/Time', 'Callsign', 'Class', 'Section', 'Band', 'Mode'],
            'headerClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'noData':'No contacts',
            'addTxt':'Add Contact',
            'addFn':'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',0,null);'
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
            'html':'Map provided by Tim EI8IC',
            },
        'mode_band_stats':{'label':'Statistics', 'type':'simplegrid', 'num_cols':15,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'stats' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'cellClasses':['bold', ''],
            'sortable':'yes',
            'sortTypes':['text','number','number','number','number','number','number','number','number','number','number','number','number','number','number'],
            'headerValues':['Mode','160','80','40','20','15','10','6','2','220','70','SAT','GOTA','Other','Totals'],
            'headerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'footerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
        'section_band_stats':{'label':'', 'type':'simplegrid', 'num_cols':15,
            'visible':function() { return M.size != 'compact' 
                && (M.qruqsp_fielddaylog_main.menu.sections._tabs.selected == 'stats' 
                    || M.qruqsp_fielddaylog_main.menu.uisize == 'large') 
                ? 'yes' : 'hidden'; },
            'cellClasses':['bold', ''],
            'sortable':'yes',
            'sortTypes':['text','number','number','number','number','number','number','number','number','number','number','number','number','number','number'],
            'headerValues':['Mode','160','80','40','20','15','10','6','2','220','70','SAT','GOTA','Other','Totals'],
            'headerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'footerClasses':['aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            },
    }
    this.menu.imageURL = function(s, i, d, img_id) {
        //return '/qruqsp-mods/fielddaylog/ui/maps/base.jpg';
//        return M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID, 'sections':'ONN,NNY,CO,IA,WI,NM,MS,LA,AR'});
        return M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID, 'sections':this.data.map_sections});
    }
    this.menu.keyUp = function(e,s,i) {
        if( e.keyCode == 13 ) {
            this.addQSO();
            return false;
        } else {
            this.updateDups();
        }
        return true;
    }
    this.menu.updateDups = function() {
        M.api.getJSONBgCb('qruqsp.fielddaylog.dupSearch', {'tnid':M.curTenantID, 'callsign':this.formValue('callsign')}, function(rsp) {
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
        });
    }
    this.menu.liveSearchCb = function(s, i, v) {
        if( s == 'search' && v != '' ) {
            M.api.getJSONBgCb('qruqsp.fielddaylog.qsoSearch', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'25'}, function(rsp) {
                M.qruqsp_fielddaylog_main.menu.liveSearchShow('search',null,M.gE(M.qruqsp_fielddaylog_main.menu.panelUID + '_' + s), rsp.qsos);
                });
        }
    }
    this.menu.liveSearchResultValue = function(s, f, i, j, d) {
        return this.cellValue(s, i, j, d);
    }
    this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
        return this.rowFn(s, i, d);
    }
    this.menu.cellValue = function(s, i, j, d) {
        if( s == 'scores' || s == 'mydetails' ) {
            switch(j) {
                case 0: return '<b>' + d.label + '</b>';
                case 1: return d.value;
            }
        }
        if( s == 'compact_dups' ) {
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
                case 6: return d.frequency;
//                case 6: return d.operator;
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
                case 12: return (d.label=='Totals'?'<b>'+d.gota.num_qsos+'</b>':d.gota.num_qsos);
                case 13: return (d.label=='Totals'?'<b>'+d.other.num_qsos+'</b>':d.other.num_qsos);
                case 14: return '<b>' + d.totals.num_qsos + '</b>';
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
                case 12: return (d.gota.num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 13: return (d.other.num_qsos > 0 ? 'statusgreen ' : '') + 'aligncenter';
                case 0: 
                case 14: return 'statusgrey aligncenter bold';
            }
        }
        if( this.sections[s].cellClasses != null ) {
            return this.sections[s].cellClasses[j];
        }
        return '';
    }
    this.menu.rowFn = function(s, i, d) {
        if( s == 'qsos' || s == 'recent' || s == 'duplicates' ) {
            return 'M.qruqsp_fielddaylog_main.qso.open(\'M.qruqsp_fielddaylog_main.menu.open();\',\'' + (d != null ? d.id : '') + '\');';
        }
        return null;
    }
    this.menu.footerValue = function(s, i, sc) {
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
                case 12: return this.data.totals[s].gota.num_qsos;
                case 13: return this.data.totals[s].other.num_qsos;
                case 14: return this.data.totals[s].totals.num_qsos;
            }
        }
        return null;
    }
    this.menu.switchTab = function(t) {
        this.sections._tabs.selected = t;
        this.refreshSection('_tabs');
        this.showHideSections(['search', 'recent', 'areas', 'vareas', 'map', 'map_credit', 'mode_band_stats', 'section_band_stats']);
        this.refreshMap();
    }
    this.menu.expandUI = function() {
        if( this.uisize == 'large' ) {
            this.uisize = 'normal';
        } else {
            this.uisize = 'large';
        }
        this.reopen();
    }
    this.menu.refreshMap = function() {
        console.log('refresh map');
        var url = M.api.getBinaryURL('qruqsp.fielddaylog.mapGet', {'tnid':M.curTenantID, 'sections':this.data.map_sections}); // + '&t=' + new Date().getTime();
//        url = '/qruqsp-mods/fielddaylog/ui/maps/base.jpg';
        var e = M.gE(this.panelUID + '_map_image_id_preview').firstChild;
        e.src = url;
    }
    this.menu.downloadCabrillo = function() {

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
            p.data.scores = rsp.scores;
            p.data.mydetails = rsp.mydetails;
//            p.data.qsos = rsp.qsos;
            p.data.recent = rsp.recent;
            p.data.areas = rsp.areas;
            p.data.vareas = rsp.vareas;
            p.data.sections = rsp.sections;
            p.data.map_sections = rsp.map_sections;
            p.data.stats = rsp.stats;
            p.showHideSections(['_tabs']);
            p.refreshSections(['compact_dups', 'duplicates','scores', 'mydetails', 'recent','areas','vareas','mode_band_stats', 'section_band_stats']); 
            p.showHideSections(['_notes', 'recent', 'areas', 'vareas', 'map', 'map_credit', 'mode_band_stats', 'section_band_stats']);
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
            p.sections._notes.visible = 'hidden';
            if( M.size != 'compact' && rsp.settings != null && rsp.settings['ui-notes'] != null && rsp.settings['ui-notes'] == 'yes' ) {
                p.sections._notes.visible = 'yes';
            }
            p.refresh();
            p.show(cb);
        });
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
            p.setFieldValue('callsign', '');
            p.setFieldValue('class', '');
            p.setFieldValue('section', '');
            p.refreshSections(['compact_dups', 'duplicates','scores', 'mydetails', 'recent','areas','vareas','mode_band_stats', 'section_band_stats']);
            p.refreshMap();
            M.gE(p.panelUID + '_callsign').focus();
        });
    }
    this.menu.addClose('Back');

    //
    // The panel to list all the qso
    //
    this.qsos = new M.panel('qso', 'qruqsp_fielddaylog_main', 'qsos', 'mc', 'large', 'sectioned', 'qruqsp.fielddaylog.main.qsos');
    this.qsos.data = {};
    this.qsos.nplist = [];
    this.qsos.sections = {
        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':6,
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'hint':'Search callsigns',
            'noData':'No callsigns found',
            },
        'qsos':{'label':'All Contacts', 'type':'simplegrid', 'num_cols':6, 
            'headerValues':['Date/Time', 'Callsign', 'Class', 'Section', 'Band', 'Mode'],
//
//          Sorting on a large list (+1000) will stall browser for multiple minutes, not good!
//            'sortable':'yes',
//            'sortTypes':['date', 'text', 'text', 'text', 'number', 'text'],
            'headerClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
            'cellClasses':['', '', 'aligncenter', 'aligncenter', 'aligncenter', 'aligncenter'],
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
                case 6: return d.frequency;
            }
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
            'qso_dt':{'label':'UTC Date Time of QSO', 'type':'text', 'required':'yes'},
            'callsign':{'label':'Callsign', 'required':'yes', 'type':'text'},
            'class':{'label':'Class', 'required':'yes', 'type':'text'},
            'section':{'label':'Section', 'required':'yes', 'type':'text'},
            'band':{'label':'Band', 'required':'yes', 'type':'text'},
            'mode':{'label':'Mode', 'required':'yes', 'type':'text'},
            'frequency':{'label':'Frequency', 'type':'text'},
            'operator':{'label':'Operator', 'type':'text'},
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
        if( confirm('Are you sure you want to remove qso?') ) {
            M.api.getJSONCb('qruqsp.fielddaylog.qsoDelete', {'tnid':M.curTenantID, 'qso_id':this.qso_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.qruqsp_fielddaylog_main.qso.close();
            });
        }
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
    this.settings = new M.panel('Contact', 'qruqsp_fielddaylog_main', 'settings', 'mc', 'narrow', 'sectioned', 'qruqsp.fielddaylog.main.settings');
    this.settings.data = null;
    this.settings.settings_id = 0;
    this.settings.nplist = [];
    this.settings.sections = {
        '_station':{'label':'Station Callsign', 'fields':{
            'callsign':{'label':'Callsign', 'type':'text'},
            'class':{'label':'Class', 'type':'text'},
            'section':{'label':'Section', 'type':'text'},
            }},
        '_ui':{'label':'Interface Settings', 'fields':{
            'ui-notes':{'label':'Use notes', 'type':'toggle', 'default':'no', 'toggles':{'no':'No', 'yes':'Yes'}},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.qruqsp_fielddaylog_main.settings.save();'},
            }},
        };
    this.settings.fieldValue = function(s, i, d) { return this.data[i]; }
    this.settings.fieldHistoryArgs = function(s, i) {
        return {'method':'qruqsp.fielddaylog.settingsHistory', 'args':{'tnid':M.curTenantID, 'setting':i}};
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
    this.settings.addClose('Cancel');

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
            alert('App Error');
            return false;
        }
        
        this.menu.open(cb);
    }
}
