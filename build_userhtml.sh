#!/bin/bash
NOW=`date "+%Y%m%d%H%M%S"`
rm -rf _publish
tools/apache-ant-1.9.4/bin/ant -buildfile development/build.xml
tar czvf userhtml.$NOW.tar.gz -C _publish userhtml
scp userhtml.$NOW.tar.gz root@115.29.160.95:/alidata/deploy/dist

