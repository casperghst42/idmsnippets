# Javascript Code Snippets for NetIQ Identity Manager

## Assumptions
Json data for all functions dealing with json
```json
[
    {
        "email": "jdoe@acme.com",
        "fullname": "Joe Doe"
    },
    {
        "email": "agatonsax@acme.com",
        "fullname": "Agaton Sax"
    }
]
```


**Find an object in an JSON string (useful with the RestDriver)**
```javascript
/**
 * returns either a array with found object or empty
 * @param {string} jsonString
 * @param {string} needle 
 * @return {string} array with found object or empty array
*/
function findByEmail(jsonstring, needle) {
    try {        
        const normalizedNeedle = needle.toLowerCase();
        const result = JSON.parse(jsonString).filter(e => e.email?.toLowerCase() === normalizedNeedle);
        return JSON.stringify(result);
    }

    catch(e) {
        log("JSON Error: " + e)
        return('[]')
    }
}

```

