/**

 * @Overview	Simple functions to handle JSON
 * @Version		1.0.4 - 2021-04-21
 * @author 		Casper Pedersen
 * @license     https://creativecommons.org/licenses/by-sa/4.0/
**/


/**
 * Will add/set attribute with value in jsonString
 * @param {string} jsonString 
 * @param {string} attrName 
 * @param {string} attrValue 
 * @return {string}
 */
function addAttrValue(jsonString, attrName, attrValue) {

    try {
       var jsonObject = JSON.parse(jsonString)

        attrValue = attrValue.replace(/&amp;/g, "&")

        if (attrName.indexOf('.') > 0) {

            var parentName = attrName.split('.')[0]
            var childName = attrName.split('.')[1]

            var childObject = JSON.parse("{}")
            if (jsonObject.hasOwnProperty(parentName)) {                
                childObject = jsonObject[parentName]                
            } 
            childObject[childName] = attrValue
            jsonObject[parentName] = childObject

        } else {
            jsonObject[attrName] = attrValue
        }
        jsonString = JSON.stringify(jsonObject)
    }

    catch (e) {
        return jsonString
    }

    return jsonString
}

/* test code 
var text = addAttrValue("{}", "givenname", "Joe")
var text = addAttrValue(text, "user_fields.department", "fun and games")
var text = addAttrValue(text, "user_fields.costcenter", "unlimited")
var text = addAttrValue(text, "email", "joe.doe@acme.com")
console.log(text)
*/