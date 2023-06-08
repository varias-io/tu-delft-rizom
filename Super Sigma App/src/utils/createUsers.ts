import { User } from "../entities/User.js"
import { entityManager } from "./database.js"

interface CreateUsersProps {
    users: string[]
}

/**
 * Function that checks whether channels are in the database and if not adds them. 
 * It returns a list of Users.
 */
export const createUsers = async ({users}: CreateUsersProps) => {
    const newUsers: User[] = []
    for(const user of users) {
      const found = await entityManager.findOneBy(User, { slackId: user })
      if(found == null){
        entityManager.create(User, {slackId: user}).save()
        entityManager.findOneBy(User, {slackId: user }).then((u) =>{
          if(u != null){
            newUsers.push(u)
        }
      })
      } else{
        newUsers.push(found)
      }
    }
  
    return newUsers
  }