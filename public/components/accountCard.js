function AccountCard(accounts) {
    let accountCards = ''

    if (typeof accounts !== 'object') {
        return (
            '<div class="card" id="addAccountCard">' +
                '<p>+</p>' +
            '</div>'
        )
    }

    for (const key in accounts) {
        accountCards +=
            '<div class="card" id="card" value=' + key + ' style="background-color: ' + accounts[key]['color']+ ';">' +
                '<p>' + accounts[key]['accountName'] + '</p>' +
            '</div>'
    }

    accountCards += 
        '<div class="card" id="addAccountCard">' +
            '<p>+</p>' +
        '</div>'

    return accountCards
}

export { AccountCard }