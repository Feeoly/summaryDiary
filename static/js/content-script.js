// if "run_at": "document_start", the following js will be run
document.addEventListener('DOMContentLoaded', function()
{
	console.log('run_at: document_start');
});

let summary = [];
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    // request is the object that you send as message to contentScript
	if(request.sendType === 'START'){
        console.log('contentScript receives: ' + request.title, request);
        // listen mouseup
        $(document.body).mouseup((e)=>{
            let txt;
            let parentOffset = { left: 0, top: 0} // $(this).offset()
            // e.pageX and e.pageY indicate the el's position in the whole page.
            let x = e.pageX - parentOffset.left;
            let y = e.pageY - parentOffset.top;
            let clientX = e.clientX || 0
            let clientY = e.clientY || 0
            let target = e.target
            let toolTipEl = document.querySelector('.tooltip-wrapper')
            
            txt = window.getSelection();
            console.log('txt:', txt)
            if (toolTipEl && toolTipEl.contains(target)) {
                // send response back to popup
                sendResponse({
                    message: 'start run...'
                });

                // send message to background
                chrome.runtime.sendMessage({sendType: 'COLLECT', store: summary[summary.length -1]},function(response){
                    console.log('response from background: ' + response.message);
                })
            }
            if (txt.toString().length > 1) {
                toolTip({top: clientY, left: clientX})
                let now = new Date()
                let store = {
                    date: now,
                    title : request.title,
                    url: request.url,
                    selection: txt.toString()
                }
                summary.push(store)
            }
        })
    }
    if (request.sendType === 'SHOWALL') {
        // 获取summary wrapper，通过判断元素存在与否，来看是否需要展示或关闭summary
        const summaryEl = document.querySelector('.zyc-bg-wrapper')
        if (summaryEl) {
            closeSummary(summaryEl)
        } else {
            showAll(summary, false)
            // send response back to popup
            sendResponse({
                message: 'summary is show...'
            });
        }

    }
})

// create container to show the summary
let outWrapper = '',
    allContentItem = '',
    bgWrapper = `<div class="zyc-bg-wrapper">${outWrapper}</div>`,
    titleArr = [];
//render
function render(store, showImmediate = true) {
    if (showImmediate) {
        $('body').append(bgWrapper)
    }
    let data = store,
        title = data.title,
        url = data.url,
        content = data.selection,
        date = data.date;

    // different html part
    let wrapperWT = `<div class="zyc-bg-box">
        <h3 class="zyc-bg-title">${title}</h3>
        <span class="zyc-bg-url">${url}</span>
        <span class="zyc-bg-date">${date}</span>
        <div class="zyc-bg-content">
            <span class="zyc-bg-item">${content}</span>
        </div>
    </div>`,
        wrapperNT = `<div class="zyc-bg-item">${content}</div>`,
        wrapper = wrapperWT,
        hasExist = false; // check whether is the same article, v1.0.0 only check from the title(tab name)

    if (!titleArr.length) {
        titleArr.push({
            title: title,
            times: 1,
        })
    } else {
        hasExist = loopInTitleArr()
        if (hasExist) {
            wrapper = wrapperNT
        } else {
            wrapper = wrapperWT
        }
    }

    if (showImmediate){
        if (hasExist) {
            $('.zyc-bg-content').append(wrapper)
        } else {
            $('.zyc-bg-wrapper').append(wrapper)
        }
        return;
    }
    if (hasExist) {
        if (!outWrapper) outWrapper = wrapperWT // in case of outer content wrapper not exit
        allContentItem += wrapper
    } else {
        outWrapper = wrapper
    }
}

// find same title
function loopInTitleArr(title) {
    console.log('titleArr=', titleArr)
    for(let item in titleArr) {
        if (item.title == title) {
            item.times ++; // plus one
            return true
        }
    }
    titleArr.push({ // add the new one
        title: title,
        times: 1,
    })
    return false;
}

/**
 * show summary
 * @param {Object} summary source
 * @param {Boolean} showImmediate whether render source immediate when it be choosen
 */
function showAll(summary, showImmediate) {
    for (let store in summary) {
        render(summary[store], showImmediate)
    }
    let bgWrapper = `<div class="zyc-bg-wrapper">${outWrapper}</div>`;
    $('body').append(bgWrapper)
    $('.zyc-bg-content').append(allContentItem)
}

/**
 * close summery
 * @param {*} target 
 */
function closeSummary(target) {
    $(target).remove()
}

/**
 * locate toolTip
 * @param {*} pos 
 */
function toolTip(pos = {top: 0, left: 0}) {
    if (!document.querySelector('.tooltip-wrapper')) {
        let toolTip = `<div class="tooltip-wrapper">
            <div class="tooltip-add">+</div>
        </div>`
        console.log(toolTip)
        $('body').append(toolTip)
    }
    $('.tooltip-wrapper').css({ top: pos.top, left: pos.left})
}




// window.getSelection() returns:
// focusNode: text
// assignedSlot: null
// baseURI: "https://www.runoob.com/jquery/jquery-tutorial.html"
// childNodes: NodeList []
// data: "本章节的每一篇都包含了在线实例"
// firstChild: null
// isConnected: true
// lastChild: null
// length: 15
// nextElementSibling: null
// nextSibling: null
// nodeName: "#text"
// nodeType: 3
// nodeValue: "本章节的每一篇都包含了在线实例"
// ownerDocument: document
// parentElement: h2.tutheader
// parentNode: h2.tutheader
// previousElementSibling: null
// previousSibling: null
// textContent: "本章节的每一篇都包含了在线实例"
// wholeText: "本章节的每一篇都包含了在线实例"
// __proto__: Text
// focusOffset: 11