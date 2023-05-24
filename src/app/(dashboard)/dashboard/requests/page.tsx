import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libraries/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // here we want to find out ID's of current log-in people who sent us the request (we are fetching ID's from database)
  const incomingSendersIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  // now we want those ID's display as users emails instead of bunch of strings
  // ZJISTIT JAK FUNGUJE PROMISE
  const incomingFriendRequests = await Promise.all(
    incomingSendersIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string; //this comes back as JSON.string so we have to convert that into string first 
      const senderResult = JSON.parse(sender) as User

      return {
        senderId,
        senderEmail: senderResult.email,
      };
    })

  );


  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
