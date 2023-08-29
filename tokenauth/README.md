# Token based Authentication with SOAP driver

### Introduction 

The IDM Soap Driver was designed to use Basic Authentication (remember it is old, like really old) and there have been no updates to it - in that area.

Once in a while we run into SOAP end-points which require a token (OAuth2) *) for operation authentication, which can cause a few gray hairs.

*) the same goes for using Bearer tokens, JWT and other obscure authentication methods.

The way I go around dealing with this specific problem is to deal with like this:


- in the Startup Transformation Policy I create a policy which set the driver global variables I need to be able to keep the tolken in memory. Like the token it self, life time, and mayby an URL (some systems use a different URL for authention and operation - and the one for operation is only provided during authention).

- in the Subscriber Event Transformation Policy I create a policy which takes care of making sure that the token has not expired (or actually exist) and will do the actual authentiaction, and then store the informaiton in the variables, for use in the OTP.

- in the Output Tranformation SoapIfy XSLT I create the HTML or SOAP header with the required informaiton. 

(see easy ... not).

So..

- Create a number of GCVs to store the Auth URL, Username, Password and maybe Token.
- Create the policy in the Startup to keep the.
- Create the policy in the Subscriber EVT to handle the authentication part.
- Add code to the SoapIfy Stylesheet to construct the authentication header.
- Create some code in the input transoformation to handle the authentication response (soap-doc to xds-doc(instance)).
.... and a bit more.

### a. GCVs (example)
``` xml
<definition display-name="* My Soft Authentication Id" name="drv.soap.username" type="string">
	<description/>
	<value>myusername@soap-end-point.com</value>
</definition>
<definition display-name="* My Soft Authentication Password" name="drv.soap.password" type="password-ref">
	<description/>
	<value>drv.sf.soap.named-password</value>
</definition>
<definition display-name="* My Soft Authentication URL" name="drv.soap.auth-url" type="string">
	<description/>
	<value>https://www.something-very-wacky.com/auth</value>
</definition>
<definition display-name="* My Soft Authentication Request" name="drv.soap.auth-req" type="string" multiline="true">
	<description/>
	<value>&lt;nds dtdversion="4.0" ndsversion="8.x">
		&lt;source>
		&lt;product edition="Advanced" version="4.8.6.0000">DirXML&lt;/product>
		&lt;contact>NetIQ Corporation&lt;/contact>
	&lt;/source>
	&lt;input>
		&lt;soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
			&lt;driver-operation-data>
				&lt;request-headers remove-existing="true">
					&lt;request-header name="content-type">text/xml&lt;/request-header>
				&lt;/request-headers>
			&lt;/driver-operation-data>
			&lt;soapenv:Header>
				<!-- 
					Magic stuff goes here 
				-->
			&lt;/soapenv:Header>
		&lt;/soapenv:Envelope>
&lt;/nds>
	</value>
</definition>>
```

You need to fill the "Magic stuff" part, as that is something which is unique to your soap end-point. I normally copy paste from SoapUI.

### b. Startup Policy

Do something like this (example):
```xml
<rule>
	<description>Startup - create driver variables</description>
	<comment xml:space="preserve">Set the variables for the auth token.</comment>
	<conditions/>
	<actions>
		<do-set-local-variable name="serverUrl" scope="driver">
			<arg-string/>
		</do-set-local-variable>
		<do-set-local-variable name="sessionSecondsValid" scope="driver">
			<arg-string>
				<token-text xml:space="preserve">0</token-text>
			</arg-string>
		</do-set-local-variable>
		<do-set-local-variable name="token" scope="driver">
			<arg-string>
				<token-text xml:space="preserve">0</token-text>
			</arg-string>
		</do-set-local-variable>
	</actions>
</rule>
```
You might not need all of this, you might need more - you have to see what your endpoint requires.

### c. the authentication

This is where the interesting things happen.

1. check the validity of the token (now + something > expiration time), or something like that (you need to figure that out yourself).
2. build a login request to the service<br/>
- create an soap request (xds request), base it on your GCV(drv.soap.auth-req).<br/>
- remember to add the correct namespace definition for XdsCommandProcessor, otherwise you will get problems. 
```
xmlns:cmd="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.driver.XdsCommandProcessor" 
```

- execute the request
```xml
		<do-set-local-variable name="lvTmp" scope="policy">
			<arg-node-set>
				<token-xpath expression="cmd:execute($destCommandProcessor, $lvCommand/nds)"/>
			</arg-node-set>
		</do-set-local-variable>
```
- verify that the request was successful and gather the information you need<br/>
```xml
		<do-if>
			<arg-conditions>
				<and>
					<if-xpath op="not-true">$lvTmp//self::status[@level = 'success']</if-xpath>
				</and>
			</arg-conditions>
			<arg-actions>
				<do-trace-message color="red">
					<arg-string>
						<token-text xml:space="preserve">FATAL: </token-text>
						<token-xpath expression="$lvTmp//self::status/text()"/>
					</arg-string>
				</do-trace-message>
				<do-status level="fatal">
					<arg-string>
						<token-xpath expression="$lvTmp//self::status/text()"/>
					</arg-string>
				</do-status>
			</arg-actions>
			<arg-actions/>
		</do-if>
```
I do still discuss with my self if a negative response to the authentication should end with an 'fatal', 
but I think that it is better that the driver terminates if there is something wrong, than it continue to run with 
operations which errors out.

- now you need to fill the global variables you need to use for the request to work later on.<br/>
(see 5. for more on this)
``` xml
		<do-set-local-variable name="serverUrl" scope="driver">
			<arg-string>
				<token-xpath expression="$lvTmp//instance/attr[@attr-name='theUrltoUse']/value"/>
			</arg-string>
		</do-set-local-variable>
		<do-set-local-variable name="token" scope="driver">
			<arg-string>
				<token-xpath expression="$lvTmp//instance/attr[@attr-name='token']/value"/>
			</arg-string>
		</do-set-local-variable>		
		<do-set-local-variable name="sessionvalidinseconds" scope="driver">
			<arg-string>
				<token-xpath expression="$lvTmp//instance/attr[@attr-name='sessionvalidinseconds']/value"/>
			</arg-string>
		</do-set-local-variable>
		...
```




3. Setup Operation Data.<br/>
As I am still to find a way to address local-variables from XSLT I have choosen to use Operation-Data to be able to use XSLT to create my authentication header.
```xml
		<do-set-op-property name="serverUrl">
			<arg-string>
				<token-local-variable name="serverUrl"/>
			</arg-string>
		</do-set-op-property>
		<do-set-op-property name="token">
			<arg-string>
				<token-local-variable name="token"/>
			</arg-string>
		</do-set-op-property>
```

4. Construct the Soap Authentication.<br/>
As the serverURL can change you need to set that in the driver-operation-data and the token is often used in the soap header.
```xml
<xsl:template match="add[@class-name='User']....">
	<xsl:message>Output: Add SOAP Headers</xsl:message>
	<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"...>
		<xsl:element name="driver-operation-data">
			<xsl:attribute name="url">
				<xsl:value-of select="//operation-data/@serverUrl"/>
			</xsl:attribute>
		</xsl:element>
		<soapenv:Header>
				<urn:header>
					<urn:token>
						<xsl:value-of select="//operation-data/@token"/>
					</urn:token>
				</urn:header>
			</soapenv:Header>
			<soapenv:Body>
				<xsl:copy>
					<xsl:apply-templates select="node()|@*"/>
				</xsl:copy>
			</soapenv:Body>
		</soapenv:Envelope>
	</soapenv:Envelope>
</xsl:template>
```
That will create a soap-request which is using a token to authenitcate. 


5. Least but not last - the Input Transformation policy.<br/>
For this to work, you need to handle the authentication response in your input transformaiton. You can do it using DirXML-Script or XSLT. I do find this is easier to do using XSLT.
```xml
	<xsl:template match="authResponse">
		<xsl:message>Input: process loginResponse</xsl:message>
		<status level="success"/>
		<instance>
			<attr attr-name="serverUrl">
				<value>
					<xsl:value-of select="result/serverUrl"/>
				</value>
			</attr>
			<attr attr-name="token">
				<value>
					<xsl:value-of select="result/token"/>
				</value>
			</attr>
			<attr attr-name="sessionSecondsValid">
				<value>
					<xsl:value-of select="result/sessionvalidinseconds"/>
				</value>
			</attr>
		</instance>
	</xsl:template>
```
The instance is then used in section 2. 



Could be done nicer, but it works. I have tried to cover most of what is needed, you will need to fill in the missing parts. 

