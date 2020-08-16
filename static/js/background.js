
// 返回属于你的插件的每个活动页面的窗口对象列表
let views = chrome.extension.getViews({type:'popup'}); // 返回popup对象
if(views.length > 0) {
    console.log(views[0].location.href);
}
function test(){
	console.log('我是background');
}
// 返回background页
let bg = chrome.extension.getBackgroundPage();
bg.test();
console.log(bg.document.body.innerHTML); // 访问background的DOM

// listen the message from contentScript, to collect the txt
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.sendType === 'COLLECT'){
        console.log('background-store', request.store)
        sendResponse({
            message: 'collecting...'
        });
    }
});

