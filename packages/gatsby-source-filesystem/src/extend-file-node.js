const { GraphQLString } = require(`gatsby/graphql`)
const fs = require(`fs-extra`)
const path = require(`path`)

module.exports = ({ type, getNodeAndSavePathDependency, pathPrefix = `` }) => {
  if (type.name !== `File`) {
    return {}
  }

  return {
    publicURL: {
      type: GraphQLString,
      args: {},
      description: `Copy file to static directory and return public url to it`,
      resolve: (file, fieldArgs, context) => {
        const details = getNodeAndSavePathDependency(file.id, context.path)
        const fileName = `${file.internal.contentDigest}/${details.base}`

        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          fileName
        )

        if (!fs.existsSync(publicPath)) {
          fs.copy(
            details.absolutePath,
            publicPath,
            { dereference: true },
            err => {
              if (err) {
                console.error(
                  `error copying file from ${details.absolutePath} to ${publicPath}`,
                  err
                )
              }
            }
          )
        }

        return `${pathPrefix}/static/${fileName}`
      },
    },
  }
}
