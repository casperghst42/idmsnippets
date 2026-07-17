# Code Snippets for NetIQ Identity Manager

Small things, which I sometimes forget how to do.... 

## Block empty operations

For years I've been doing this:

```xml
<rule>
    <description>Block Empty Operations</description>
    <conditions>
        <and>
            <if-class-name mode="nocase" op="equal">User</if-class-name>
            <if-operation mode="regex" op="equal">add|modify</if-operation>
            <if-xpath op="not-true">count((self::modify|self::add)/*[name() != 'association']) > 0</if-xpath>
        </and>
    </conditions>
    <actions>
        <do-veto/>
    </actions>
</rule>
```

Then I was looking at something else and found this in an old Novell AD Driver configuration, which will do the exact same (there is no need to test for the association when you can test on the attributes):

```xml
<rule>
		<description>Block Empties Modify Operations</description>
		<conditions>
			<and>
				<if-class-name mode="nocase" op="equal">User</if-class-name>
				<if-operation mode="nocase" op="equal">modify</if-operation>
				<if-xpath op="not-true">modify-attr</if-xpath>
			</and>
		</conditions>
		<actions>
			<do-veto/>
		</actions>
	</rule>
```

