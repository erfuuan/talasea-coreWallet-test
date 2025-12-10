// import Service from '../service/index.js'
// import cryptography from '../utils/libraries/cryptography.js'
// import appConfig from '../config/application.js'
// import { RequestToService } from '../utils/libraries/requestProvider.js'
// import httpContext from 'express-http-context'
// import responseBuilder from '../utils/http/responseBuilder.js'
// import chalk from 'chalk'
// import Helper from '../utils/helper.js'


// process.env['service-login'] = true

// const ignoredPath = [
//   "GET /api/v1/account-settings/user/health",
//   "GET /api/v1/account-settings/role/health",
//   "GET /api/v1/account-settings/account/health",
// ];

// export default async (req, res, next) => {
//   try {
//     if (ignoredPath.includes(`${req.method} ${req.originalUrl}`)) { return next() }
//     const accessToken = req.headers.authorization
//     if (!accessToken) { return responseBuilder.unauthorized(res, "", "user unauthorized") }
//     let token;
//     token = await Service.redisHandler.Redis.get(accessToken)
//     if (!token) {
//       // set cache token request
//       console.log('=====> send @req to gw');
//       const cacheRes = await RequestToService(
//         req,
//         appConfig.login.SERVICE_NAME,
//         appConfig.login.BASE_URL + appConfig.login.SET_TOKEN_CACHE + accessToken,
//         {
//           method: 'POST',
//           maxAttempts: process.env['service-login'] ? 10 : 1
//         }
//       )
//       // console.log(cacheRes)
//       // if (cacheRes.status != '200' || cacheRes.status != 200 && !cacheRes.data) {
//       //   return responseBuilder.unauthorized(res, "", "user unauthorized")
//       // }

//       //?===========================
//       if (!cacheRes?.response) {
//         console.log(cacheRes)
//         return responseBuilder.unauthorized(res)
//       }
//       //?===========================

//       //?--------------------comment----------------------
//       //  create token cache
//       // await Service.redisHandler.Redis.put(
//       //   cacheRes.response.data.token.key,
//       //   cacheRes.response.data.token.value,
//       //   cacheRes.response.data.token.expire
//       // )
//       // token = cacheRes.response.data.token.value
//       //?--------------------comment----------------------
//       // } catch (error) {
//       // console.log('service couldn not catch token detail from login service!');
//       // process.env['service-login'] = false
//     }
//     //------------------------------------------------------------ check service config
//     //?--------------------comment----------------------
//     // const { workspace, user, configs, packageInfo } = JSON.parse(cryptography.base64.decode(token))
//     //?--------------------comment----------------------
//     token = await Service.redisHandler.Redis.get(accessToken)

//     const { workspace, user, configs, packageInfo } = JSON.parse(await cryptography.decryptAES256GCM(token))
//     //* ================================================
//     req.workspace = workspace
//     req.userData = user
//     req.packageInfo = packageInfo
//     httpContext.set('timezone', workspace.timezone || 'UTC')
//     //* ================================================
//     // if (process.env[workspace.name]) { //servicesConfig[workspace.name]
//     //     return next();
//     // } 
//     process.env[workspace.name] = JSON.stringify(configs)



//     //?===============================member_activity_time==================================
//     const member_activity_time = await Service.redisHandler.Redis.get(await cryptography.hashSHA256(`activity_time_${accessToken}`))
//     console.log(member_activity_time)
//     if (member_activity_time && workspace.security_configuration?.session_duration) {
//       const sessionDuration = await Helper.convertToSeconds(workspace.security_configuration.session_duration)
//       const diffTime = Math.abs(Math.floor((new Date() - new Date(member_activity_time)) / 1000))
//       console.log({ diffTime, sessionDuration })
//       if (diffTime > sessionDuration) {
//         console.log('diffTime > sessionDuration and system  send @req to gw for delete tokens');
//         const callApiDeleteToken = await RequestToService(
//           req,
//           appConfig.login.SERVICE_NAME,
//           appConfig.login.BASE_URL + appConfig.login.INTERNAL_LOGOUT,
//           {
//             method: 'POST',
//             maxAttempts: process.env['service-login'] ? 10 : 1,
//             body: { description: "session_duration_time_out" }
//           }
//         )
//         return responseBuilder.unauthorized(res)
//       } else {
//         await Service.redisHandler.Redis.put(await cryptography.hashSHA256(`activity_time_${accessToken}`), new Date())
//       }
//     }
//     //?===============================member_activity_time==================================

//     return next();
//     // if (configs) {
//     //     process.env[workspace.name] = JSON.stringify(configs)   //servicesConfig[workspace.name]
//     // } else {
//     //     try {
//     //         const configs = await RequestToService(
//     //             request,
//     //             appConfig.login.SERVICE_NAME,
//     //             appConfig.login.BASE_URL + appConfig.login.GET_DEFAULT_SERVICES_CONFIG + workspace.name,
//     //             {
//     //                 method: 'GET',
//     //             })
//     //             process.env[workspace.name] = JSON.stringify(configs.response.data)    // servicesConfig[workspace.name]
//     //         return next()
//     //     } catch (error) {
//     //         next(httpError(401, ' service couldn not catch default config! '))
//     //     }
//     // }
//     // return next();
//   } catch (err) {
//     console.log(chalk.underline.red("✖ err from apiAuth middlware : "), err)
//     return responseBuilder.internalErr(res)
//   }
// }