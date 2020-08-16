$(function () {
    // click to start run
    $('.start-btn').click(e => {
        console.log('---start---');
        sendMsgToContentScript({sendType: 'START'}, function(response){
            console.log('response from contetn-script.js: ' + response);
        });
    });
    // click to stop run
    $('.stop-btn').click(e => {
        console.log('---end---');
    });
    
    // click to show all summary
    $('.show-btn').click(e => {
        console.log('---show---');
        sendMsgToContentScript({sendType: 'SHOWALL'}, function(response){
            console.log('response from contetn-script.js: ' + response);
        });
    });

    // query tab and then sendMessage to tab
    function sendMsgToContentScript(message, callback){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            let messageInfo = {...message, ...tabs[0]}
            console.log('query tabs:', tabs, messageInfo)
            chrome.tabs.sendMessage(tabs[0].id, messageInfo, function(response){
                if(callback) callback(response);
            })
        })
    }
})