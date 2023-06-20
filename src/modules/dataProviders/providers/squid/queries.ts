

export const squidSubQueryNotifications = `
        subscription {
          notifications(limit: 300, orderBy: activity_blockNumber_DESC) {
            id
            account {
              id
            }
            activity {
              id
              blockNumber
              event
              account {
                id
              }
              extension {
                id
                nftId
                amount
                chain
                collectionId
                decimals
                extensionSchemaId
                token
                txHash
                url
                fromEvm {
                  id
                }
                fromSubstrate {
                  id
                }
                parentPost {
                  id
                  summary
                  body
                  ownedByAccount {
                    id
                  }
                }
                toEvm {
                  id
                }
                toSubstrate {
                  id
                }
              }
              post {
                id
                body
                summary
                kind
                ownedByAccount {
                  id
                }
                space {
                  id
                }
                rootPost {
                  id
                  space {
                    id
                  }
                }
                extensions {
                  id
                  extensionSchemaId
                }
              }
            }
          }
        }
    `