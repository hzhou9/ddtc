<?php
    
    $view = $_GET['v'];
    $type = $_GET['t'];
    
    //todo:根据版本来设置p，实现内容动态更新
    $p = '';
    if($view == 'tixianop' || $view == 'jifenop2'){
        if($type == 'html')
        $p = '?20150721';
    }

    $url = $view.'/'.$view.'.'.$type.$p;
    

header("Location: ".$url);

?>