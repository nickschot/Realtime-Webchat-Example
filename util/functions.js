var HtmlEntities = require('html-entities').AllHtmlEntities;

function escapeHtml(val){
    return HtmlEntities(val);
}

function escapeMessageObj(obj){
    return {
        username: escapeHtml(obj.username),
        message: escapeHtml(obj.message)
    };
}

module.exports = {
    escapeHtml: escapeHtml,
    escapeMessageObj: escapeMessageObj
}
