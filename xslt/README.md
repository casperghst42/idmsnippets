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

