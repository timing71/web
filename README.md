# Timing71 website

![AGPL v3.0](https://img.shields.io/github/license/timing71/web)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/timing71/web/main.yml)

This repo hosts the source code for the Timing71 website.

Timing71 is a web-based motorsport live timing aggregation and analysis suite,
allowing users to view live timing with an enhanced display and real-time
strategy analysis, as well as offering post-event replays and analysis.

## Development quick-start

Requires `node` v16 or greater.

```bash
  yarn install
  yarn run start
```

To run tests:

```bash
  yarn run test
```

## IP note

This repo does _not_ contain any code relating to acquisition of data from
specific timing providers (`Service`s in Timing71 parlance). Builds of this repo
that do not include the private `@timing71/services` package will therefore not
include the full feature set of Timing71 and not be able to process live timing
from upstream providers.

## Adding a new service provider

The code that interfaces with upstream timing providers should inherit from the
`Service` base class:

```javascript
import { Service } from '@timing71/common';

class SomeTimingCompanyService extends Service {
  constructor(onStateUpdate, onManifestUpdate, service) {
    super(onStateUpdate, onManifestUpdate, service);
    // whatever additional setup needs to happen
  }

  start(connectionService) {
    // Begin collecting data - connectionService provides a `fetch` method as
    // well as `createWebsocket`
  }

  stop() {
    // perform any cleanup here
  }
}
```

For convenience, `@timing71/common` also provides an `HTTPPollingService` base
class for services relying on polling an HTTP URL for data.
