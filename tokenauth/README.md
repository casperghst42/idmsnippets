# Token based Authentication with SOAP driver

### Introduction 

The IDM Soap Driver was designed to use Basic Authentication (remember it is old, like really old) and there have been no updates to it - in that area.

Once in a while we run into SOAP end-points which require a token (OAuth2) *) for operation authentication, which can cause a few gray hairs.

*) the same goes for using JWT and other obscure authentication methods.

The way I go around dealing with this specific problem is to deal with like this:


- in the Startup Transformation Policy I create a policy which set the driver global variables I need to be able to keep the tolken in memory. Like the token it self, life time, and mayby an URL (some systems use a different URL for authention and operation - and the one for operation is only provided during authention).

- in the Subscriber Event Transformation Policy I create a policy which takes care of making sure that the token has not expired (or actually exist) and will do the actual authentiaction, and then store the informaiton in the variables, for use in the OTP.

- in the Output Tranformation SoapIfy XSLT I create the HTML or SOAP header with the required informaiton. 

(see easy).

So..

- Create a number of GCVs to store the Auth URL, Username, Password and maybe Token.
- Create the policy in the Startup to keep the.
- Create the policy in the Subscriber EVT to handle the authentication part.
- Add code to the SoapIfy Stylesheet to construct the authentication header.

### a. GCVs (example)
``` xml
<definition display-name="* My Soft Authentication Id" name="drv.sf.soap.username" type="string">
	<description/>
	<value>myusername@soap-end-point.com</value>
</definition>
<definition display-name="* My Soft Authentication Password" name="drv.sf.soap.password" type="password-ref">
	<description/>
	<value>drv.sf.soap.named-password</value>
</definition>
<definition display-name="* My Soft Authentication URL" name="drv.sf.soap.auth-url" type="string">
	<description/>
	<value>https://www.something-very-wacky.com/auth</value>
</definition>
```

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


(work in progress)