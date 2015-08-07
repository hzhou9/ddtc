<?php
/**
* 
*/
include_once("../config.php");

$url = "http://duduche.me/html/secenhtml/".VER_ADM."/js/index.js";
//$url = "http://duduche.me/html/secenhtml/js/index.js?_r=".time();

    if(is_array($_GET)&&count($_GET)>0){
        $appendix = null;
        foreach($_GET as $k=>$v){
            if($appendix == null){
                $appendix = $k."=".$v;
            }else{
                $appendix .= "&".$k."=".$v;
            }
        }
        $url .= "?".$appendix;
    }

header("Location: ".$url);

?>
