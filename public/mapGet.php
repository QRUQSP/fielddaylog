<?php
//
// Description
// -----------
// This function will return the image binary data in jpg format.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:         The ID of the tenant to get the image from.
// image_id:            The ID if the image requested.
// version:             The version of the image (original, thumbnail)
//
//                      *note* the thumbnail is not referring to the size, but to a 
//                      square cropped version, designed for use as a thumbnail.
//                      This allows only a portion of the original image to be used
//                      for thumbnails, as some images are too complex for thumbnails.
//
// maxwidth:            The max width of the longest side should be.  This allows
//                      for generation of thumbnail's, etc.
//
// maxlength:           The max length of the longest side should be.  This allows
//                      for generation of thumbnail's, etc.
//
// Returns
// -------
// Binary image data
//
function qruqsp_fielddaylog_mapGet(&$ciniki) {
    //
    // Check args
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'), 
        'sections'=>array('required'=>'no', 'blank'=>'yes', 'type'=>'list', 'name'=>'Sections'), 
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
    $rc = qruqsp_fielddaylog_checkAccess($ciniki, $args['tnid'], 'qruqsp.fielddaylog.mapGet');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Check cache
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'tenants', 'hooks', 'cacheDir');
    $rc = ciniki_tenants_hooks_cacheDir($ciniki, $args['tnid'], array());
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.fielddaylog.12', 'msg'=>'', 'err'=>$rc['err']));
    }
    $cache_file = $rc['cache_dir'] . '/fielddaymap.jpg';
    if( isset($ciniki['session']['qruqsp.fielddaylog']['map_sections']) 
        && $ciniki['session']['qruqsp.fielddaylog']['map_sections'] == $args['sections']
        && file_exists($cache_file)
        ) {
        $map = new Imagick($cache_file);
    } else {
/*        $map = imagecreatefrompng($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/back_with_lines.png');
        if( isset($args['sections'][0]) && $args['sections'][0] != '' ) {
            foreach($args['sections'] as $s) {
                if( file_exists($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/' . $s . '.png') ) {
                    $overlay = imagecreatefrompng($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/' . $s . '.png');
                    imagecolortransparent($overlay, 
                    $overlay->paintTransparentImage("rgb(111,196,249)", 0, 3000);
                    $map->compositeImage($overlay, Imagick::COMPOSITE_DEFAULT, 0, 0);
                }
            }
        }
        $map->setImageFormat('jpeg');
        $map->setImageCompressionQuality(60);
        $map->writeImage($cache_file); 
*/
        $map = new Imagick($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/back_with_lines.png');
       
        if( isset($args['sections'][0]) && $args['sections'][0] != '' ) {
            foreach($args['sections'] as $s) {
                if( file_exists($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/' . $s . '.png') ) {
                    $overlay = new Imagick($ciniki['config']['qruqsp.core']['modules_dir'] . '/fielddaylog/maps/' . $s . '.png');
                    $map->compositeImage($overlay, Imagick::COMPOSITE_DEFAULT, 0, 0);
//                    $map->compositeImage($overlay, Imagick::COMPOSITE_COPY, 0, 0);
                    error_log('done: ' . microtime());
                }
            }
        }
        $map->setImageFormat('jpeg');
        $map->setImageCompressionQuality(60);
        $map->writeImage($cache_file); 

        $ciniki['session']['qruqsp.fielddaylog']['map_sections'] = $args['sections'];
        sort($ciniki['session']['qruqsp.fielddaylog']['map_sections']);
    }

    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT', true, 200);
    header("Content-type: image/jpeg"); 

    echo $map;
    
    return array('stat'=>'exit');
}
?>
