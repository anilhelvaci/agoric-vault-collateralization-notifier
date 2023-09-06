import { useState, useEffect } from "react";
import { BellAlertIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import Empty from "../components/empty";
import { ConnectedEmailModal } from "../components/connectedEmailModal";
import { ConnectedNotifierModal } from "../components/connectedNotifierModal";
import { NotifierList } from "../components/notifierList";
import { useAuth } from "../contexts/auth";
import { useNotifiers } from "../contexts/notifiers";

const Notifications = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [notifiers, setNotifiers] = useState([]);
  const [showCreateNotifier, setShowCreateNotifier] = useState(false);
  const { isLoggedIn } = useAuth();
  const { getNotifiers, remove } = useNotifiers();

  const handleNotifierCreated = () => {
    fetchNotifiers(true);
    setShowCreateNotifier(false);
  };

  const fetchNotifiers = async (refetch = false) => {
    try {
      const data = await getNotifiers(refetch);
      setNotifiers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchNotifiers(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteNotifier = async ({ id }) => {
    try {
      const res = await remove(id);
      if (res.success) fetchNotifiers(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          {notifiers && notifiers.length > 0 ? (
            <NotifierList
              notifiers={notifiers}
              handleCreateNotifier={() => setShowCreateNotifier(true)}
              handleDeleteNotifier={deleteNotifier}
            />
          ) : (
            <Empty
              title="No Notifiers Found"
              description="Create a notifier to get started."
              graphic="notification"
              buttonText="Create Notifier"
              onClick={() => setShowCreateNotifier(true)}
              ButtonIcon={() => (
                <BellAlertIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  aria-hidden="true"
                />
              )}
            />
          )}
          <ConnectedNotifierModal
            visible={showCreateNotifier}
            setIsVisible={setShowCreateNotifier}
            onSuccess={handleNotifierCreated}
          />
        </>
      ) : (
        <>
          <Empty
            title="No Notifications"
            description="Sign in with email to get started."
            graphic="notification"
            buttonText="Sign In"
            onClick={() => setShowLogin(true)}
            ButtonIcon={() => (
              <EnvelopeIcon
                className="-ml-0.5 mr-1.5 h-5 w-5"
                aria-hidden="true"
              />
            )}
          />
          <ConnectedEmailModal
            visible={showLogin}
            setIsVisible={setShowLogin}
          />
        </>
      )}
    </>
  );
};

export default Notifications;
