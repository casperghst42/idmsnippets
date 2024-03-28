/**

 * @Overview	Generate SSH Keys
 * @Version		1.0.4 - 2021-04-21
 * @author 		Casper Pedersen
 * @license     https://creativecommons.org/licenses/by-sa/4.0/
 *
 * ConvertNodeSetToString(..) is from NOVLLIBAJC-JC with the license which applies to that. 
**/

/** 
 * Serialize a NodeSet to a String (From NOVLLIBAJC-JS)
 *
 * @param {NodeSet} nodeset     nodeset to be serialized
 * @type String
 * @return  serialized NodeSet
 */
function ConvertNodeSetToString(nodeset) {
    var node = nodeset.first();
    var sw = new java.io.StringWriter();
    var dw = new Packages.com.novell.xml.dom.DOMWriter(node, sw);
    dw.write();
    var str = sw.toString();
    sw.close();
    return str;
}

/**
 * generateSshKeyPair
 *
 * @param {String} PassPhrase           passphrase to encrypt the private key
 * @param {String} Comment              comment to be added to the public key
 * @param {String} KeyType              valid values: DSA, RSA, ECDSA
 * @param {int}    Size                 1024, 2048 ...
 * @type NodeSet
 * return NodeSet containing instance and status
 * 
 *
 * <output>
 *  <instance>
 *      <attr attr-name="privateKey">
 *          <value> ... </value>
 *      </attr>
 *      <attr attr-name="publicKey">
 *          <value> ... </value>
 *      </attr>
 *  </instance>
 *  <status level="success|error"/>
 * </output>
 */

function generateSshKeyPair(PassPhrase, Comment, KeyType, Size) {

    var tracer = new Packages.com.novell.nds.dirxml.driver.Trace("GenerateSSHKeyPair");

    var nodeSet = new Packages.com.novell.xml.xpath.NodeSet();
    var document = Packages.com.novell.xml.dom.DocumentFactory.newDocument();
    var ndsElement   = document.createElement("nds");
    
    document.appendChild(ndsElement);
    ndsElement.setAttributeNS(null, "dtdversion", "4.0");   
    
    var outputElement = document.createElement("output");
    ndsElement.appendChild(outputElement);

    tracer.trace("Generating SSH Keypair", 0);
    tracer.trace("PassPhrase: " + PassPhrase, 99);
    tracer.trace("Comment: " + Comment, 0);
    tracer.trace("Size: " + Size, 0);
    
    var _keytype = 0;
    
    if(KeyType == "DSA") {
        _keytype = com.jcraft.jsch.KeyPair.DSA;
        tracer.trace("KeyType: DSA", 3);
    } else if(KeyType == "RSA") {
        _keytype = com.jcraft.jsch.KeyPair.RSA;
        tracer.trace("KeyType: RSA", 3);
    } else if(keyTYpe == "ECDSA") {
        _keytype = com.jcraft.jsch.KeyPair.ECDSA;
        tracer.trace("KeyType: ECDSA", 3);
    } else {
        // Return error     
    }
    
    try {
        var jsch = new com.jcraft.jsch.JSch();
        var kpair = com.jcraft.jsch.KeyPair.genKeyPair(jsch, _keytype);

        var privateStream = new java.io.ByteArrayOutputStream();
        var publicStream = new java.io.ByteArrayOutputStream();

        /* Generate Private Key */
        kpair.writePrivateKey(privateStream, new java.lang.String(PassPhrase).getBytes("UTF8"));        
        privateKey = new java.lang.String(privateStream.toByteArray());
        
        tracer.trace("Private Key: " + privateKey, 99);
        
        /* Generate Public Key  */
        kpair.writePublicKey(publicStream, Comment);
        publicKey = new java.lang.String(publicStream.toByteArray());
        
        tracer.trace("Public Key: " + publicKey, 99);
        

        /*
         * <instance>
         * <attr name="privateKey">
         *      <value type="string"> ... </value>
         * </attr>
         * <attr name="publicKey">
         *      <value type="string"> ... </value>
         * </attr>
         * 
         */

        var instanceElement = document.createElement("instance");

        /* Add privateKey to output document */     
        var attrPrivate = document.createElement("attr");
        attrPrivate.setAttributeNS(null, "attr-name", "privateKey");
        var valuePrivate = document.createElement("value");
        valuePrivate.appendChild(document.createTextNode(privateKey));
        attrPrivate.appendChild(valuePrivate);
        
        instanceElement.appendChild(attrPrivate);
        
        /* Add publicKey to output document */
        var attrPublic = document.createElement("attr");
        attrPublic.setAttributeNS(null, "attr-name", "publicKey");
        var valuePublic = document.createElement("value");
        valuePublic.appendChild(document.createTextNode(publicKey));
        attrPublic.appendChild(valuePublic);
        
        instanceElement.appendChild(attrPublic);
        
        outputElement.appendChild(instanceElement);
        
        /**
        * We got this far, so everything must be good 
        */
        var statusElement = document.createElement("status");
        statusElement.setAttributeNS(null, "event-id", "0");
        statusElement.setAttributeNS(null, "level", "success");
        outputElement.appendChild(statusElement);

        tracer.trace("Keypair Generated", 0);
    }

    catch (e) {
        tracer.trace("Error: " + e.toString(), 5);

        var statusElement = document.createElement("status");
        statusElement.setAttributeNS(null, "event-id", "0");
        statusElement.setAttributeNS(null, "level", "error");
        statusElement.appendChild(document.createTextNode(e.toString()));
        outputElement.appendChild(statusElement);
    }

    nodeSet.add(outputElement);     
    
    tracer.trace(ConvertNodeSetToString(nodeSet), 5);
        
    return nodeSet;
}
