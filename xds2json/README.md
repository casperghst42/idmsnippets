### XDS to JSON

This is complex, no REST end-point is the same as the other one, which means that you will end up writing a converter for each end-point, and it is by far the most complex part of writing the REST driver (unless if results to queries are windowed). 

It is not complex by having complex code, there is just a lot of it (sometimes). 

In this example I will make it as simple as absolutily possible, also to make my life easier.

I spend some time trying to make this as simple as possible, without having to use NetIQ's horrible xds2json converter (which was designed to produce scim data - I guess).

I will based my example on something which is close to [ZenDesk](https://developer.zendesk.com/api-reference/ticketing/users/users/) or [Okta](https://developer.okta.com/docs/reference/api/users/) which are the APIs I've spend most of my time with.

Let's say that we have a REST end-point which takes the following JSON to create a user:

```json
{
    "user": {
        "username": "joedoe",
        "firstname": "Joe",
        "lastname": "Doe",
        "email": "joe.doe@acme.com",
        "user_fields": {
            "department": "Fun and Games",
            "costcenter": "Unlimited"
        }
    }
}
```

And using the following schema mapping:

cn ==> username
givenname ==> firstname
surname ==> lastname
internet email address ==> email
department ==> user_fields.department
costcenter ==> user_fields.costcenter

##The transformation
The input document would look like:
```xml
<add class-name="User" src-dn="joedoe">
    <association>joedoe</association>
    <add-attr attr-name="CN">
        <value type="string">joedoe</value>
    </add-attr>
    <add-attr attr-name="Given Name">
        <value type="string">Joe</value>
    </add-attr>
    <add-attr attr-name="Surname">
        <value type="string">Doe</value>
    </add-attr>
    <add-attr attr-name="department">
        <value type="string">Fun and Games</value>
    </add-attr>
    <add-attr attr-name="costcenter">
        <value type="string">Unlimited</value>
    </add-attr>
    <add-attr attr-name="Internet EMail Address">
        <value type="string">joe.doe@adme.com</value>
    </add-attr>
</add>
```
After schema mapping.
```xml
<add class-name="User" src-dn="joedoe">
    <association>joedoe</association>
    <add-attr attr-name="username">
        <value type="string">joedoe</value>
    </add-attr>
    <add-attr attr-name="firstname">
        <value type="string">Joe</value>
    </add-attr>
    <add-attr attr-name="lastname">
        <value type="string">Doe</value>
    </add-attr>
    <add-attr attr-name="user_fields.department">
        <value type="string">Fun and Games</value>
    </add-attr>
    <add-attr attr-name="user_fields.costcenter">
        <value type="string">Unlimited</value>
    </add-attr>
    <add-attr attr-name="email">
        <value type="string">joe.doe@adme.com</value>
    </add-attr>
</add>
```

Which makes it easy to transform to the JSON required by the end-point.

##The Code
(I have used JavaScript to to some of the heavy lifting, but for this example I'll use plain DirXML-Script).
The limitation of DirXML-Script will make this complex, but it will not be impossible to do. You can replace the part of this with JavaScript, using functions to add attributes and build arrays which will make the DirXML-Script simpler but the JavaScript part will then become complex(er).

###Meta Code
```
json={}
for each add-attr or modify-attr
    get attrname
    get attrvalue
    add attr to json
```

Quit simple, isn't ?

```xml
<do-set-local-variable name="json" scope="policy">
    <arg-string>
        <token-text xml:space="preserve">{}</token-text>
    </arg-string>
</do-set-local-variable>
<do-for-each>
    <arg-node-set>
        <token-xpath expression="add-attr|modify-attr"/>
    </arg-node-set>
    <arg-actions>
        <do-set-local-variable name="lvAttrName" scope="policy">
            <arg-string>
                <token-xpath expression="$current-node/@attr-name"/>
            </arg-string>
        </do-set-local-variable>
        <do-set-local-variable name="lvAttrValue" scope="policy">
            <arg-string>
                <token-xpath expression="$current-node/value"/>
            </arg-string>
        </do-set-local-variable>
        <do-set-local-variable name="json" scope="policy">
            <arg-string>
                <token-xpath expression="js:addAttrValue($json, $lvAttrName, $lvAttrValue)"/>
            </arg-string>
        </do-set-local-variable>
    </arg-actions>
    <do-set-local-variable name="json" scope="policy">
        <arg-string>
            <token-text xml:space="preserve">{ "user" : $json$ }</token-text>
        </arg-string>
    </do-set-local-variable>
</do-for-each>
```
As for the javascript code to add the attr (name+value) to the json string is also quite simple (you could write it in DirXML-Script if you feel like).


```javascript
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
```

You can add more checks and handling of integers (which could be handy), but in general it works.

Converted XDS:
```json
{ "user" : {"username":"joedoe","firstname":"Joe","lastname":"Doe","user_fields":{"department":"Fun and Games","costcenter":"Unlimited"},"email":"joe.doe@adme.com"} }
```

Now you just have to add it to the input value node ... 
