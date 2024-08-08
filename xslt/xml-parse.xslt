<?xml version="1.0" encoding="UTF-8"?>
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

		<xsl:variable name="stringWriter" select="stringwriter:new()" />
		<xsl:variable name="domWriter"    select="domwriter:new(exsl:node-set($mynode-set), $stringWriter)" />
		<xsl:variable name="temp"         select="domwriter:write($domWriter)" />
		<xsl:variable name="serialized"   select="stringwriter:toString($stringWriter)" />
		<xsl:value-of select="$serialized" />
	</xsl:template>	

</xsl:stylesheet>