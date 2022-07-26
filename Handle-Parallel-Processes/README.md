# Handle Parallel Processes in a Driver
Some years ago I was discussing an issue with a customer which made me think.

The situation was that the customer had a system where they would receive updates from the authorozied system in an csv file, which is qhite normal. The csv file could have multiple updates to the same identity in it, and there could be +10000 lines in the file.

## Problem at Hand
The customer was using Storage Manager to move user data between servers and between sites. 

As the authrozied source would managed by an administrator (just go along with that), and that administrator sometimes made mistakes it could happen that the administrator would move a number of identites from SiteA to SiteB and then discover it was an error and then change it to SiteZ. The system running the authorized source would gather that in multiple events and next time the system was pulled for updates it would send all these changes across. Causing Storage Manager to send data from SiteA to SiteB and then to SiteZ - causing more than a few problems.

I discussed the situation with a collauge (Dimi, Consulting NL) who came suggested to find a way to block all other drivers from touching the identities until the import was done.

## A possible solution
**This has now changed due to a change in the Delimited Text Driver Shim, which now returns one event per line in the csv file, and not as earlier one event with all the operations.**

dstragg had a good sugestion **) and using the input from my form colleague from consulting, I came up with this:

**) [Delimited Text Driver and multiline CSVs](https://community.microfocus.com/cyberres/netiq-identity-governance-administration/idm/f/idm_discussion/516649/delimited-text-driver-and-multiline-csvs/1907282#1907282)

- in the startup policies create an local variable (driver) (counter variable) and set it the value to 0
- in the input transformation create an policy to handle when there is an hearbeat and when there have been processing prior to the heartbeat.



### Step 1 - add counter vairables
This needs to be done in the Startup Policies.
```xml
<do-set-local-variable name="lvOperationCounter" scope="driver">
    <arg-string>
        <token-xpath expression="0"/>
    </arg-string>
</do-set-local-variable>
```

### Step 2 - act on 'heartbeat' and do stuff
```xml
<rule>
    <description>Detect Heartbeat</description>
    <conditions>
        <and>
            <if-xpath op="true">self::status[@level = 'success' and @type = 'heartbeat']</if-xpath>
        </and>
    </conditions>
    <actions>
        <do-if>
            <arg-conditions>
                <and>
                    <if-local-variable mode="nocase" name="gvOperationCounter" op="not-equal">0</if-local-variable>
                </and>
            </arg-conditions>
            <arg-actions>
                <do-trace-message>
                    <arg-string>
                        <token-text xml:space="preserve">INFO: should do something here!</token-text>
                    </arg-string>
                </do-trace-message>
            </arg-actions>
            <arg-actions/>
        </do-if>
        <do-set-local-variable name="gvOperationCounter" scope="policy">
            <arg-string>
                <token-text xml:space="preserve">0</token-text>
            </arg-string>
        </do-set-local-variable>
        <do-break/>
    </actions>
</rule>
```
In the "should do something" section you could remove the "stopper" attribute from all the users which has it (more about that later).

### Step 3 - add counter information to each operation
```xml
<rule>
    <description>Add Counter Info</description>
    <conditions>
        <and>
            <if-class-name mode="nocase" op="equal">user</if-class-name>
            <if-operation mode="nocase" op="equal">add</if-operation>
        </and>
    </conditions>
    <actions>
        <do-set-local-variable name="gvOperationCounter" scope="driver">
            <arg-string>
                <token-xpath expression="number($gvOperationCounter) + 1"/>
            </arg-string>
        </do-set-local-variable>
        <do-set-op-property name="OperationCounter">
            <arg-string>
                <token-text xml:space="preserve">$gvOperationCounter$</token-text>
            </arg-string>
        </do-set-op-property>
    </actions>
</rule>
```

This will add an operation-data attribute with the operation count (line number from the csv), it does not do anything but to keep track of line number.

### Step 4 - add a stopper attribute to the user
To each user which is being added or modified add an attribute which stops all other drivers to act on the add or modify. I would suggest to do that in the Command Transformation.

For this example I'm using the description attribute.
```xml
<rule>
    <description>Add Stopper Attr</description>
    <conditions>
        <and>
            <if-class-name mode="nocase" op="equal">user</if-class-name>
            <if-op-property name="OperationCounter" op="available"/>
        </and>
    </conditions>
    <actions>
        <do-add-dest-attr-value name="description">
            <arg-value type="string">
                <token-text xml:space="preserve">--DO-NOT-TOUCH--</token-text>
            </arg-value>
        </do-add-dest-attr-value>
    </actions>
</rule>
```

Then in all your drivers add a rule which vetos all operations (except for query) if the user have description='--DO-NOT-TOUCH--'.

### Setup 5 - how to clean up and let other drivers process the add/modifiction
Something like this should work:
```xml
<do-for-each>
    <arg-node-set>
        <token-query datastore="dest">
            <arg-dn>
                <token-global-variable name="idv.dit.data.users"/>
            </arg-dn>
            <arg-match-attr name="description">
                <arg-value type="string">
                    <token-text xml:space="preserve">--DO-NOT-TOUCH--</token-text>
                </arg-value>
            </arg-match-attr>
        </token-query>
    </arg-node-set>
    <arg-actions>
        <do-remove-dest-attr-value name="description">
            <arg-dn>
                <token-xpath expression="$current-node$"/>
            </arg-dn>
            <arg-value type="string">
                <token-text xml:space="preserve">--DO-NOT-TOUCH--</token-text>
            </arg-value>
        </do-remove-dest-attr-value>
    </arg-actions>
</do-for-each>
```

### Summary
As far as I know, this problem can only be seen with the Delmited Text Driver, meaning it's the only driver which can have multiple updates for the same object, which makes sense.