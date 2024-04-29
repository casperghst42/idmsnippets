# Setting NamedPassword from DirXML-Script

We all know the feeling where someone ask a question and you don't really have an answer. This one was asked a few years back, and I didn't have an answer. 

How do I set a Named Password from a Policy, without using javascript.

It took a bit of time to figure it out, as you can call dxcmd via a system call from Java, but it's not really the best way to do things (just my personal opinion).

According to the documentation for [com.novell.nds.dirxml.util.DxCommand](https://www.novell.com/documentation/developer/dirxml/dirxmlbk/api/com/novell/nds/dirxml/util/DxCommand.html) tells us that we can call "commandLine(String commandLineArgs)" (Run DxCommand with a single string containing the command line arguments.), which could be the same parameters as show with 'dxcmd --help'.

That make is a bit easier.

1) Setup a NameSpace defninition with:
    xmlns:dxcmd="http://www.novell.com/nxsl/java/com.novell.nds.dirxml.util.DxCommand"<br/>
    That will allow us to call dxcmd:commandLine(..) directly and not via a Java Systemcall. 
2) Create a local variable with the commandline (verify it please):
```xml
<do-set-local-variable name="lvCommandLine" scope="policy">
	<arg-string>
		<token-text xml:space="preserve">-q -dnform dot -user </token-text>
		<token-global-variable name="drv.cmd.user"/>
		<token-text xml:space="preserve"> -password </token-text>
		<token-named-password name="drv.user.password"/>
		<token-text xml:space="preserve">-host localhost -setnamedpassword </token-text>
		<token-parse-dn dest-dn-format="dot">
    		<token-global-variable name="dirxml.auto.driverdn"/>
		</token-parse-dn>
		<token-text xml:space="preserve"> mynamedpassword <token-text>
		<token-generate-password policy-dn="\[root]\Security\Password Policies\Sample Password Policy"/>
	</arg-string>
</do-set-local-variable>
```
3) Call dxcmd:commandLine
```xml
<do-set-local-variable name="lvResult" scope="policy">
	<arg-string>
		<token-xpath expression="dxcmd:commandLine(string($lvCommandLine))"/>
	</arg-string>
</do-set-local-variable>
```

That is it, the Named Password is set.

There is a hitch, this might not make the password available to the driver. If not you will have to restart the driver.