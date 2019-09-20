const Config = require('ssb-config/inject')
const ssbKeys = require('ssb-keys');
const fs = require('fs');

// The port the ssb-server should listen on
let port = process.env.PORT;

// If 'true', an invite code will be generated and printed to STDOUT when the server starts. Useful for connecting two instances together
// for testing. Can be redeemed when starting another instance by using the 'INVITE' environment variable.
let generateInvite = process.env.GENERATE_INVITE;

// The directory on the filesystem which should be used to store the data. If it doesn't already exist, it will be created.
// If it already exists, the files won't be overwritten.
const dir = process.env.DATA;

// Optionally process the invite code value (https://github.com/ssbc/ssb-server/wiki/pub-servers#what-is-an-invite-code) to connect to
// another ssb server and have the nodes follow each other.
const invite = process.env.INVITE;

// Optionally use the supplied base64 representation of a scuttlebutt key JSON object ( https://github.com/ssbc/ssb-keys#keys )
const keyBase64 = process.env.SSB_SECRET_KEYPAIR

// Optionally load the scuttlebutt key file at the given filesystem path
const keyPath = process.env.SSB_KEYPATH

// The external host to use when generating an invite code. Defaults to 127.0.0.1
const externalHost = process.env.EXTERNAL_HOST

if (!port) {
    console.log("Fatal: PORT environment variable required.");
    process.exit(1);
} else {
    port = parseInt(port);
}

if (generateInvite) {
    generateInvite = generateInvite.toLowerCase() === "true"
} else {
    generateInvite = false
}

if (!dir) {
    console.log("Fatal: DATA environment variable required.");
    process.exit(1);
}

if (keyPath && keyBase64) {
    console.log("Fatal: Both SSB_SECRET_KEYPAIR and SSB_KEYPATH ($SSB_KEYPATH) are defined. Only one option may be used.")
}

if (keyPath && !fs.existsSync(keyPath)) {
    console.log(`Fatal: No key at given path ${keyPath}`)
    process.exit(1);
}

if (keyBase64) {
    console.log("Loaded key from key command line argument");
}

if (externalHost) {
    console.log(`Setting external host to ${externalHost}`);
}

console.log(`Starting on port ${port} using data directory ${dir} ...`);

function createSbot() {

    let keys = null;

    if (!keyBase64 && !keyPath) {
        // If no key was passed in from a command line argument, generate one
        console.log(`Generating secret key in ${dir} directory.`)
        keys = ssbKeys.loadOrCreateSync(dir + '/secret');
    }
    else if (keyPath) {
        keys = ssbKeys.loadOrCreateSync(keyPath);
    } else if (keyBase64 && keyBase64.length === 0 ) {
        console.log("FATAL: empty key for SSB_SECRET_KEYPAIR environment variable")
        process.exit(1);
    } else {
        // Passed in as a Base64 encoded environment variable
        let buff = Buffer.from(keyBase64, 'base64');  
        let keyText = buff.toString('utf-8');

        // The key file generated has # comments at the start, if these are present we remove them
        // so that we can successfully run JSON.parse on it
        var jsonText = keyText
        .replace(/\s*\#[^\n]*/g, '')
        .split('\n').filter(v => !!v).join('')

        keys = JSON.parse(jsonText);       
    }

    const config = Config('test123', {
        port,
        path: dir,
        keys: keys
    })

    config.connections.incoming.net[0].external = externalHost || '127.0.0.1'

    var Create = require('ssb-server')
        .use(require('ssb-private'))
        .use(require('ssb-master'))
        .use(require('ssb-local'))
	.use(require('ssb-backlinks'))
	.use(require('ssb-about'))
	.use(require('ssb-query'))
        .use(require('ssb-gossip'))
        .use(require('ssb-invite'))
        .use(require('ssb-replicate'))
        .use(require('ssb-friends'))
        .use(require('scuttlebutt-akka-persistence-index'))

    return Create(config);
}

const sbot = createSbot((err, result) => {
    console.log(err);
    console.log(result);
});

if (invite) {
    sbot.invite.accept(invite, (err, result)=> {
        console.log(err);
        console.log(result);
    })
} 

if (generateInvite) {
    sbot.invite.create(1, (err, result) => {
        console.log(result);
    })
}






