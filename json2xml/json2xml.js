/**

 * @Overview	Simple functions to handle JSON
 * @Version		1.0.4 - 2021-04-21
 * @author 		Casper Pedersen
 * @license     https://creativecommons.org/licenses/by-sa/4.0/
 *
**/


/*****************************************************************************************/
/* Functions for JSON -> XML */
/*****************************************************************************************/

/**
 * Converting a JSON String (object & array) to a XML document
 * @param jsonString
 * @param indent
 * @returns
 */
 function json2xml(jsonString, indent) {

    try {
        var jsonObject = JSON.parse(jsonString);
        return '<root>\n' + __json2xml(jsonObject, indent) + '\n</root>';
    }

    catch (e) {
        return e.toString();
    }

    return "-- ERROR --"
}


/* 
* ===================================
* Functions not to be called directly
* ===================================
*/


/*
 * This work is licensed under Creative Commons GNU LGPL License.
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/ Version: 0.9 
 * Author: Stefan Goessner/2006 Web: http://goessner.net/
 * 
 */
function __json2xml(o, tab) {

    var toXml = function (v, name, ind) {

        try {

            if (!isNaN(Number(name)))
                name = 'object';
        } catch (e) {
        }

        var xml = "";
        if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++) {
                xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            }
        }

        else if (typeof (v) == "object") {

            var hasChild = false;
            xml += ind + "<" + name;

            for (var m in v) {

                if (m.charAt(0) == "@") {
                    xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                } else
                    hasChild = true;
            }

            xml += hasChild ? ">" : "/>";

            if (hasChild) {

                for (var m in v) {
                    if (m == "#text")
                        xml += v[m];

                    else if (m == "#cdata")
                        xml += "<!&#091;CDATA&#091;" + v[m] + "&#093;&#093;>";

                    else if (m.charAt(0) != "@")
                        xml += toXml(v[m], m, ind + "\t");
                }

                xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</"
                    + name + ">";

            }
        } else {
            xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
        }

        return xml;

    }, xml = "";

    for (var m in o)
        xml += toXml(o[m], m, "");

    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}