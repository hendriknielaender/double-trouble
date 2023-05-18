// View Transitions support cross-document navigations.
// Should compare performace.
// https://github.com/WICG/view-transitions/blob/main/explainer.md#cross-document-same-origin-transitions
// https://github.com/WICG/view-transitions/blob/main/explainer.md#script-events
function shouldDisableSpa() {
    return false;
}

function updateTheDOMSomehow(data) {
    document.getElementById('content').innerHTML = data
}


async function getFragment(path) {
    return (await fetch(`${path}`)).text();
}

navigation.addEventListener('navigate', (navigateEvent) => {
    if (shouldDisableSpa()) return;

    const toUrl = new URL(navigateEvent.destination.url);
    const toPath = toUrl.pathname;
    const fromPath = location.pathname;

    navigateEvent.intercept({
        async handler() {
            const response = await fetch(`${toPath}`)
            const data = await response.text()
    
            if (!document.startViewTransition) {
                updateTheDOMSomehow(data);
                return;
            }
            const transition = document.startViewTransition(() => {
                document.getElementById('container').scrollTop = 0
                updateTheDOMSomehow(data)
              })
        
              await transition.finished
        }
    })
})