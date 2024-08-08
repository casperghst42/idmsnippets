<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="query cmd dncv"
    version="1.0"
    xmlns:cmd="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.XdsCommandProcessor"
    xmlns:dncv="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.DNConverter"
    xmlns:query="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.XdsQueryProcessor"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:soapenv="schemas.xmlsoap.org/.../">
    <xsl:param name="srcQueryProcessor" />
    <xsl:param name="destQueryProcessor" />
    <xsl:param name="srcCommandProcessor" />
    <xsl:param name="destCommandProcessor" />
    <xsl:param name="dnConverter" />
    <xsl:param name="fromNds" />
    <!-- identity transformation template -->
    <!-- in the absence of any other templates this will cause -->
    <!-- the stylesheet to copy the input through unchanged to the output -->

    <!-- We want to do this on the "soapenv:Envelope" which is inside of <input/> -->
    <xsl:template match="input">
        <xsl:message>----------------------------------------</xsl:message>
		<xsl:message>XSL: process
        input node</xsl:message>
		<xsl:message>----------------------------------------</xsl:message>	
		<xsl:variable name="xmlstring">
            <xsl:call-template name="serializeNodeToString">
                <xsl:with-param name="node" select="soapenv:Envelope" />
            </xsl:call-template>
        </xsl:variable>		
		<xsl:message>----------------------------------------</xsl:message>
		<xsl:message><xsl:value-of select="$xmlstring" /></xsl:message>
		<xsl:message>----------------------------------------</xsl:message>
		<xsl:message>Put everything nicely back together</xsl:message>
		<xsl:message>----------------------------------------</xsl:message>
		<soapenv:Envelope>
            <xsl:apply-templates select="soapenv:Envelope/*" />
        </soapenv:Envelope>
    </xsl:template>

    <!-- Serialize the Nodeset -->
    <xsl:template name="serializeNodeToString">
        <xsl:param name="node" />
		<xsl:variable name="name" select="name($node)" />
		<xsl:if test="$name">
            <xsl:value-of select="concat('&lt;',$name)" />
			<xsl:for-each select="$node/@*">
                <xsl:value-of select="concat(' ',name(),'=&quot;',.,'&quot; ')" />
            </xsl:for-each>
			<xsl:value-of select="concat('&gt;',./text())" />
        </xsl:if>
		<xsl:for-each select="$node/*">
            <xsl:call-template name="serializeNodeToString">
                <xsl:with-param name="node" select="." />
            </xsl:call-template>
        </xsl:for-each>
		<xsl:if test="$name">
            <xsl:value-of select="concat('&lt;/',$name,'&gt;')" />
        </xsl:if>
    </xsl:template>

    <!-- Default Copy Template -->
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*" />
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>