const { div, p, listener, a } = tags

router.route('/', () => {
    state.loggedIn = false
    new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
        state.loggedIn = true
    })
    
    return div(
        listener(['loggedIn'], () => {
            if (state.loggedIn) {
                return p('Logged in')
            } else {
                return p('Not logged in')
            }
        }),
        a({href: '/home'}, 'link')
    )
})