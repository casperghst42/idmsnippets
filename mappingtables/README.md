# Mapping tables




```xml
<?xml version="1.0" encoding="UTF-8"?><mapping-table>
	<col-def name="lookup1" type="nocase"/>
	<col-def name="lookup2" type="nocase"/>
	<col-def name="result" type="nocase"/>
		<row>
		<col>lo1-1</col>
		<col>lo2-1</col>
		<col>result1</col>
	</row>
		<row>
		<col>lo1-2</col>
		<col>lo2-2</col>
		<col>result2</col>
	</row>
		<row>
		<col>lo1-3</col>
		<col>lo2-3</col>
		<col>result3</col>
	</row>
	
		<row>
		<col>lo1-4</col>
		<col>lo2-4</col>
		<col>result4</col>
	</row>
	
		<row>
		<col>lo1-5</col>
		<col>lo2-5</col>
		<col>result5</col>
	</row>
</mapping-table>
```


```xml
<actions>
	<do-set-local-variable name="lv1" scope="policy">
		<arg-string>
			<token-text xml:space="preserve">lo1-3</token-text>
		</arg-string>
	</do-set-local-variable>
	<do-set-local-variable name="lv2" scope="policy">
		<arg-string>
			<token-text xml:space="preserve">lo2-3</token-text>
		</arg-string>
	</do-set-local-variable>
	<do-set-local-variable name="res1" scope="policy">
		<arg-string>
			<token-map default-value="NONE" dest="result" source="lookup1"
				table="\[root]\system\driverset1\Test Driver\three-col-mappingtable">
				<token-local-variable name="lv1" />
				<token-map-source-col name="lookup2">
					<token-local-variable name="lv2" />
				</token-map-source-col>
			</token-map>
		</arg-string>
	</do-set-local-variable>
</actions>
```




```
Test Driver :Applying policy: %+C%14CTESTPKG-sub-evt-Lookup2%-C.
Test Driver :  Applying to add #1.
Test Driver :    Evaluating selection criteria for rule 'Lookup by 2'.
Test Driver :    Rule selected.
Test Driver :    Applying rule 'Lookup by 2'.
Test Driver :      Action: do-set-local-variable("lv1",scope="policy","lo1-3").
Test Driver :        arg-string("lo1-3")
Test Driver :          token-text("lo1-3")
Test Driver :          Arg Value: "lo1-3".
Test Driver :      Action: do-set-local-variable("lv2",scope="policy","lo2-3").
Test Driver :        arg-string("lo2-3")
Test Driver :          token-text("lo2-3")
Test Driver :          Arg Value: "lo2-3".
Test Driver :      Action: do-set-local-variable("res1",scope="policy",token-map("\[root]\system\driverset1\Test Driver\three-col-mappingtable","result",default-value="NONE",source="lookup1",token-local-variable("lv1")+token-map-source-col("lookup2",token-local-variable("lv2")))).
Test Driver :        arg-string(token-map("\[root]\system\driverset1\Test Driver\three-col-mappingtable","result",default-value="NONE",source="lookup1",token-local-variable("lv1")+token-map-source-col("lookup2",token-local-variable("lv2"))))
Test Driver :          token-map("\[root]\system\driverset1\Test Driver\three-col-mappingtable","result",default-value="NONE",source="lookup1",token-local-variable("lv1")+token-map-source-col("lookup2",token-local-variable("lv2")))
Test Driver :            token-map("\[root]\system\driverset1\Test Driver\three-col-mappingtable","result",default-value="NONE",source="lookup1",token-local-variable("lv1")+token-map-source-col("lookup2",token-local-variable("lv2")))
Test Driver :              token-local-variable("lv1")
Test Driver :                Token Value: "lo1-3".
Test Driver :              token-map-source-col("lookup2",token-local-variable("lv2"))
Test Driver :                token-map-source-col("lookup2",token-local-variable("lv2"))
Test Driver :                  token-local-variable("lv2")
Test Driver :                    Token Value: "lo2-3".
Test Driver :                  Arg Value: "lo2-3".
Test Driver :                Token Value: "[lookup2, lo2-3]".
Test Driver :              Arg Value: "lo1-3,[lookup2, lo2-3]".
Test Driver :            Token Value: "result3".
Test Driver :          Arg Value: "result3".
```