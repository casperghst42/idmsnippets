/** 
  * 
  * @Overview	Simple functions to help with XML
  * @Version		1.0.0 - 2021-04-28
  * @author 		Casper Pedersen
  * @license     https://creativecommons.org/licenses/by-sa/4.0/
  * 
 **/


/*****************************************************************************************/
/* XML Functions */
/*****************************************************************************************/


/**
 * Create an XML attribute
 * @param {string} attrName 
 * @param {*} attrValue
 * @return {string}
 */
 function createXMLAttr(attrName, attrValue) {

    var value = attrValue.replace(/\&/g, "&amp;")

    var str = '<attr attr-name="' + attrName +'">'
    str += '<value>' + value + '</value>'
    str += '</attr>'

    return str
}
