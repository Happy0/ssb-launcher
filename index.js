var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys');
var commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'port', alias: 'p', type: Number },
    { name: 'dir', alias: 'd', type: String},
    { name: 'key', alias: 'k', type: String},
    { name: 'invite', type: String},
    { name: 'generate', alias: 'g', type: Boolean}
]

const options = commandLineArgs(optionDefinitions);

const port = options.port;
const dir = options.dir;
const invite = options.invite;
const generateInvite = options.generate;
const key = options.key;

if (!port) {
    console.log("Fatal: port (-p) flag required.");
    process.exit(1);
}

if (!dir) {
    console.log("--dir flag required");
    process.exit(1);
}

console.log(`Starting on port ${port} using data directory ${dir} ...`);

if (key) {
    console.log("Loaded key from key command line argument");
}

function createSbot() {

    let keys = null;

    if (!key || key.length === 0) {
        // If no key was passed in from a command line argument, generate one
        console.log("Generating secret key.")
        keys = ssbKeys.loadOrCreateSync(dir + '/secret');
    } else {
        // Passed in as a Base64 encoded environment variable
        let buff = Buffer.from(key, 'base64');  
        let keyText = buff.toString('utf-8');

        // The key file generated has # comments at the start, if these are present we remove them
        // so that we can successfully run JSON.parse on it
        var jsonText = keyText
        .replace(/\s*\#[^\n]*/g, '')
        .split('\n').filter(v => !!v).join('')

        keys = JSON.parse(jsonText);       
    }

    const config = Config('test123', {
        host: "localhost",
        port,
        path: dir,
        keys: keys
    })

    config.connections.incoming.net[0].host = '127.0.0.1'
    config.connections.incoming.net[0].external = 'fake.local'

    var Create = require('ssb-server')
        .use(require('ssb-private'))
        .use(require('ssb-master'))
        .use(require('ssb-local'))

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






