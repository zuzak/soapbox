function changeStatus(e,t){var n=document.getElementById("status");n.innerHTML=e,document.body.style.background=t||GRN}function changeMessage(e){var t=document.getElementById("message");t.innerHTML=e}function poll(e,t){t++,getJSON("/keys/"+e,function(n,r){changeStatus("Waiting"+dots(t));if(n)return changeStatus("Error! ("+n+")",RED);r.error?changeStatus(r.error,RED):r.ns?(r.msg&&changeMessage(r.msg),changeStatus(r.ns,BLU),document.getElementById("name").innerHTML=r.nick):setTimeout(function(){poll(e,t++)},2e3)})}function getJSON(e,t){var n=new XMLHttpRequest;n.open("get",e,!0),n.responseType="json",n.onload=function(){var e=n.status;e==200?t(null,n.response):t(e)},n.send()}function dots(e){str="";for(var t=0;t<e%4;t++)str+=".";return str}const RED="rgb( 200, 16, 46 )",BLU="rgb( 0, 94, 184 )",GRN="rgb( 4, 106, 56 )",BRN="rgb(121, 68, 0)";(function(){var e=document.getElementById("slug").innerHTML;changeStatus("Loaded"),poll(e,0)})()