<?php
    
    $view = $_GET['v'];
    $type = $_GET['t'];
    
    //todo:根据版本来设置p，实现内容动态更新
    $p = '';

    $url = $view.'/'.$view.'.'.$type.$p;
    

header("Location: ".$url);

?>