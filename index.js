var Config = require('ssb-config/inject')
var ssbKeys = require('ssb-keys');
var commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'port', alias: 'p', type: Number },
    { name: 'dir', alias: 'd', type: String},
    { name: 'invite', type: String},
    { name: 'generate', alias: 'g', type: Boolean}
]

const options = commandLineArgs(optionDefinitions);

const port = options.port;
const dir = options.dir;
const invite = options.invite;
const generateInvite = options.generate;

if (!port || !dir) {
    console.log("Port and dir flags required.");
}

function createSbot() {

    const config = Config('test123', {
        host: "localhost",
        port,
        path: dir,
        keys: ssbKeys.loadOrCreateSync(dir + '/secret')
    })

    config.connections.incoming.net[0].host = '127.0.0.1'
    config.connections.incoming.net[0].external = 'fake.local'

    var Create = require('ssb-server')
        .use(require('ssb-private'))
        .use(require('ssb-server/plugins/master'))
        .use(require('ssb-server/plugins/local'))

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






