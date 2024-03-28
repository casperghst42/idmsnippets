# SSH Keygen

This is something I wrote years ago, I no longer remember why. And I am for curtain, not sure if it still works. 

It will generte an SSH key (like sshkeygen), and return it in a nodeset:

It require Java Secure Channel: http://www.jcraft.com/jsch/ 

```xml
<output>
  <instance>
    <attr attr-name="privateKey">
      <value> ... </value>
    </attr>
    <attr attr-name="publicKey">
      <value> ... </value>
    </attr>
  </instance>
  <status level="success|error" />
</output>
```

