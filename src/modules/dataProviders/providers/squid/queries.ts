export const squidSubQueryNotificationsShort = `
        subscription {
          notifications(limit: 500, orderBy: activity_blockNumber_DESC) {
            id
            activity {
              blockNumber
            }
          }
        }
    `;

export const squidSubQueryActivitiesShort = `
        subscription {
          activities(limit: 500, orderBy: activity_blockNumber_DESC) {
            id
            blockNumber
          }
        }
    `;

export const getSquidQueryNotificationsFull = (ids: string[]) => `
        query {
          notifications(orderBy: activity_blockNumber_DESC, where: {id_in: [${ids
            .map((id) => `"${id}"`)
            .join(', ')}]}) {
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
    `;
