# REST Driver Pagination upon Subscriber Query

The current IDM Rest Driver (version 1.2.0) support pagination on Publisher Pull, but there is no support for doing the same on a subscriber query. I guess that due to the variation of how it is done by the end-points this would never be something which could be supported out of the box.

Though most end-points do not follow a standard, there are common thing in the transport which are common:

- limit parameter which limits the number of results returned.
- the http **response** link hearders, which always consist of 'rel="self"', and if there are more pages then also 'rel="next"' (this is the intersting one).

Otherwise there is nothing else needed. 

### How to do this

DirXML-Script can be a daunting language, it does have all the things needed to handle pargination, it will not be as neat as, for example, with Python, but it will do the job.

Python example:
```python
try:
    response.request.get(url, headers=headers, data=payload, proxies=proxies)
    response.raise_for_status()
    data = response.json()
    links = response.links
    while 'next' in links:
        url = links['next']['url']
        response = requests.get(url, headers=headers, data=payload, proxiex=proxies)
        response.raise_for_status()
        next_data = response.json()
        data += next_data
        links = response.links

    return response.status_code, data

catch ....        
```

Doing the same with DirXML-Script can be done the sameway, but require more code.

I cannot provide a fully written rule, but will give as much help as possible.

#### Getting the http and link headers
```xml
<do-set-local-variable name="lvHttpHeaders" scope="policy">
    <arg-string>
        <token-xpath expression="$current-op//response-header"/>
    </arg-string>
</do-set-local-variable>
<do-set-local-variable name="lvHttpLink" scope="policy">
    <arg-string>
        <token-xpath expression="$lvHttpHeaders/@link">
    </arg-string>
</do-set-local-variable>
```

The link header is a bit strange, it is a ';' seperated string like:

link="<https://...>; rel="self""

or 

link="<https://...>; rel="next""

Which does not really make it easy to get the link. 

#### Next link example

An example of the next link could be something like this:<br/>
**link="<https://myservice.acme.com/api/v4/users?after=99sg987wrtqeo&limit=100>; rel="next""**

This is an example and have nothing to do with reality, if it by accident does, then please let me know and I'll change it.

### BUG in NetIQ REST Driver Shim.

The (rfc5988) standard is that the response header contain both a rel="self" and if there are more pages a rel="next". The current (version 1.2.0 and later) REST Driver Shim filters out the res="self" which make it easier to get the next page, but as there is a bug (OCTCR56A629213) which will fix this, the code provided here might break at a later point in time.

#### Getting the url from the next link
This will give us the value between the < and > in the link header.
```xml
<do-set-local-variable name="lvNextLink" scope="policy">
    <arg-string>
        <token-replace-first regex=".*\&lt:(.*?)\>.*" replace-with="$1">
            <tolken-local-variable name="lvHttpLink"/>
        </token-repalce-first>
    </arg-string>
</do-set-local-variable>
```

####  Getting the path from the link 
This is the tricky part, due to the way the REST Driver is working we are only intersted in the part from the last / to the end of the string (the path).

```xml
<do-set-local-variable name="lvNext" scope="policy">
    <token-split delimiter="\?">
        <token-local-variable name="lvNextLink"/>
    </token-split>
</do-set-local-variable>
<do-set-local-variable name="lvNext" scope="policy">
    <arg-string>
        <token-text xml:space="preserve">\?</token-text>
        <token-xpath expression="$lvNext[last()]"/>
    </arg-string>
</do-set-local-variable>
```

The value of lvNext is now: **?after=99sg987wrtqeo&limit=100**

#### The next is to build the operation
```xml
<do-set-local-variable name="lvDrvOp" scope="policy">
    <arg-node-set>
        <token-xml-parse>
            <token-text xml:space="preserve">&lt;nds>&lt;input></token-text>
            <!-- drop in your driver operation template -->
            <toekn-text xml:space="preserve">&lt;/input>&lt;/nds></token-text>
        </token-xml-parse>
    </arg-node-set>
</do-set-local-variable>


<!-- 
    Do what you normally does to build a driver-operation-data node 
    Set:
    - class-name
    - command (query)

    Then set the filter so that the next query will get the next page.
-->

<do-set-xml-attr expression="$lvDrvOp//driver-operation-data[last()]/request[last()]/url-token[last()]" name="filter">
    <arg-string>
        <token-local-variable name="lvNext"/>
    </arg-string>
</do-set-xml-attr>
```

#### Execute the operation 
```xml
<do-set-local-variable name="lvResponse" scope="policy">
    <arg-node-set>
        <token-xpath expression="query:query($srcQueryProcessor, $lvDrvOp/nds)"/>
    </arg-node-set>
</do-set-local-variable>
```

Now you need to deal with the response the same way as you dealt with the $corrent-node above, and then build it into a loop (while).

This should give you enough to get going.