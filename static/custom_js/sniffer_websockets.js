function snifferInterfaceInit() {
    sendmessage(ws_sniffer, {'cmd': 'sniffstatus', 'session_name': $('#session_name').text()});
    console.log("sniffstatus");

    ws_sniffer.onmessage = function(msg) {
        data = $.parseJSON(msg.data);
        console.log(data);
        
        if (data.msg.status == 'inactive') {
            $('#startsniff').removeAttr('disabled');
            $('#stopsniff').attr('disabled','true');
        }
        else {
            // $('#session_name').text(data.msg.session_name)
            $('#startsniff').attr('disabled','true');
            $('#stopsniff').removeAttr('disabled');
        }

        sendmessage(ws_sniffer, {'cmd': 'sessionlist'});
        console.log("sessionlist");

        ws_sniffer.onmessage = function(msg) {
            data = $.parseJSON(msg.data);
            console.log(data);

            for (var i in data.msg.session_list) {
                ul = $('#sessions');
                session_links = $('<a href="/sniffer/'+data.msg.session_list[i]+'">'+data.msg.session_list[i]+'</a>');
                li = $('<li></li>');
                li.append(session_links);
                ul.append(li);
            }

            sendmessage(ws_sniffer, {'cmd': 'sniffupdate', 'session_name': $('#session_name').text()});
            console.log("sniffupdate");

            ws_sniffer.onmessage = function(msg) {
                data = $.parseJSON(msg.data);
                console.log(data);
                push_nodes(data.nodes);
                push_links(data.edges);
                start();
            };

        }      
    };
}

function getSessionList() {
    sendmessage(ws_sniffer, {'cmd': 'sessionlist'});
        console.log("sessionlist");

        ws_sniffer.onmessage = function(msg) {
            data = $.parseJSON(msg.data);
            console.log(data);

            for (var i in data.msg.session_list) {
                ul = $('#sessions');
                session_links = $('<a href="/sniffer/'+data.msg.session_list[i]+'">'+data.msg.session_list[i]+'</a>');
                li = $('<li></li>');
                li.append(session_links);
                ul.append(li);
            }
        }
}

function initSnifferWebSocket() {
    if ("WebSocket" in window) {
        ws_sniffer = new WebSocket("ws://" + document.domain + ":8080/sniffer_api");
    } else {
        console.log("WebSocket not supported");
    }

    //setTimeout(interfaceInit, 500)
}

function startsniff(){
    session_name = $('#session_name').text()
    if ( session_name != '') {
        sendmessage(ws_sniffer, {'cmd': 'sniffstart', 'session_name': session_name})
        ws_sniffer.onmessage = function (msg) {
            data = $.parseJSON(msg.data)
            console.log(data)
            $('#startsniff').attr('disabled','true')
            $('#stopsniff').removeAttr('disabled')

            ws_sniffer.onmessage = function (msg) {
                data  = $.parseJSON(msg.data)
                console.log(data)
                push_nodes(data.nodes);
                push_links(data.edges);
                start();
            };
        }
    }
    else {
        alert('Please enter a session name to continue')
    }
}

function stopsniff() {
    session_name = $('#session_name').text()
    sendmessage(ws_sniffer, {'cmd': 'sniffstop', 'session_name': session_name})

    ws_sniffer.onmessage = function (msg) {
        data = $.parseJSON(msg.data)
        console.log(data)
        $('#startsniff').removeAttr('disabled')
        $('#stopsniff').attr('disabled','true')
    }
}

