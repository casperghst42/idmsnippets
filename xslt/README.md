# XSLT
Who in the audience does not find xslt daunting. Well it is.

I am not very good at it, this is just a collection of snippits I found or been presented with, not some thing I actually have come up with.



### XML Parse (node-set())
File: [xml-parse.xslt](xml-parse.xslt)<br/>
Shoun Vella wrote this code to be able to serialize non-serialized data into eDirectory, this by it self is intersting, but it shows how to parse xml in xslt. It also shows how to use a java stringWriter in xslt, which by it self is quite intersting.

This is (as I found out) quite useful. The original article is here: [Writing custom strings into eDirectory](https://community.microfocus.com/cyberres/b/sws-22/posts/writing-custom-strings-into-edirectory), also see [node-set](https://www.xml.com/pub/a/2003/07/16/nodeset.html) at xml.com.

```xml
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"

	xmlns:domwriter="http://www.novell.com/nxsl/java/com.novell.xml.dom.DOMWriter"
	xmlns:stringwriter="http://www.novell.com/nxsl/java/java.io.StringWriter"
	xmlns:exsl="http://exslt.org/common"
	exclude-result-prefixes="domwriter stringwriter exsl">
	<xsl:template match="/">

		<xsl:variable name="mynode-set">
			<node1 attr1="test" attr2="moretext">
				<node1 attr3="text" />
			</node1>
		</xsl:variable>

		<xsl:variable name="stringWriter"
			select="stringwriter:new()" />
		<xsl:variable name="domWriter"
			select="domwriter:new(exsl:node-set($mynode-set), $stringWriter)" />
		<xsl:variable name="temp"
			select="domwriter:write($domWriter)" />
		<xsl:variable name="serialized"
			select="stringwriter:toString($stringWriter)" />
		<xsl:value-of select="$serialized" />
	</xsl:template>	

</xsl:stylesheet>
```

### Strip XML Namespace
File: [strip-namespace.xslt](strip-namespace.xslt)<br/>
The main work is done with this, which replaces "namespace:node-name" with "node-name":
```xml
<xsl:template match="*">
	<xsl:element name="{local-name()}">
		<xsl:apply-templates select="@* | node()" />
	</xsl:element>
</xsl:template>
```



### Serialize Current Operation
File: [serialize-currentop.xslt](serialize-current-op.xslt)<br/>
Someone asked if it was possible to write the current operation to a file, which ofcause is possible. But first you need to serialize the operation. You can do it using dirxml-script (for-each..), using xslt is (in my eyes) easier.<br/>
I took 'serializeNodeToString' from [Stackoverflow](https://stackoverflow.com/questions/6696382/xslt-how-to-convert-xml-node-to-string), solution provided by [Ilya Kharlamov](https://stackoverflow.com/users/805325/ilya-kharlamov)

And there is this from the Coolguys: [Writing Custom Strings into eDirectory](https://community.microfocus.com/cyberres/b/cybersecurity-blog/posts/writing-custom-strings-into-edirectory), which shows how to serialize data., but maybe not in the way you need them.


1) ```<xsl:template match="input">``` to act on the input node only
2) set a vairable equal to the output from serializeNodeToString
```xml
<xsl:variable name="xmlstring">
	<xsl:call-template name="serializeNodeToString">
		<xsl:with-param name="node" select="soapenv:Envelope" />
	</xsl:call-template>
</xsl:variable>		
```
3) write the xmlstring (serialized nodeset) to a file (not part of the exercise, and google can help with that)
