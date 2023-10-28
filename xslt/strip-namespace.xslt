<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="query cmd dncv"
	version="1.0"
	xmlns:cmd="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.XdsCommandProcessor"
	xmlns:dncv="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.DNConverter"
	xmlns:query="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.XdsQueryProcessor"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- parameters passed in from the DirXML engine -->
	<xsl:param name="srcQueryProcessor" />
	<xsl:param name="destQueryProcessor" />
	<xsl:param name="srcCommandProcessor" />
	<xsl:param name="destCommandProcessor" />
	<xsl:param name="dnConverter" />
	<xsl:param name="fromNds" />
	<!-- identity transformation template -->
	<!-- in the absence of any other templates this will cause -->
	<!-- the stylesheet to copy the input through unchanged to the output -->
	<xsl:output encoding="utf-8" indent="yes" method="xml"
		omit-xml-declaration="yes" />
	<xsl:template match="node()|@*">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" />
		</xsl:copy>
	</xsl:template>
	<!-- add your custom templates here -->
	<!-- Stylesheet to remove all namespaces from a document -->
	<!-- NOTE: this will lead to attribute name clash, if an element contains 
		two attributes with same local name but different namespace prefix -->
	<!-- Nodes that cannot have a namespace are copied as such -->
	<!-- template to copy elements -->
	<xsl:template match="*">
		<xsl:element name="{local-name()}">
			<xsl:apply-templates select="@* | node()" />
		</xsl:element>
	</xsl:template>
	<!-- template to copy attributes -->
	<xsl:template match="@*">
		<xsl:attribute name="{local-name()}">
<xsl:value-of select="." />
</xsl:attribute>
	</xsl:template>
	<!-- template to copy the rest of the nodes -->
	<xsl:tem