import * as React from 'react';
import { Text, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { BehaviorSubject } from 'rxjs';

const App = () => {

    const [ frogedOpen, setFrogedOpen ] = React.useState(false);
    const [ frogedAlerted, setFrogedAlerted ] = React.useState(false);
    const [ frogedUserId, setFrogedUserId ] = React.useState('');
    let webviewRef: any = null;

    /**
     * Send commands to webview
     * @param command Command name
     * @param params Optional command parameters
     */
    const runCommand = (command: string, params?: any) => {
        const message = { command, params };
        webviewRef.postMessage(JSON.stringify(message));
    }

    const openFroged = (requestId?: string) => {
        setFrogedOpen(true);
        runCommand('open', { requestId: requestId?? null })
    }

    const openFrogedWithRoute = (route: 'home' | 'inbox' | 'contact' | 'documents' | 'updates') => {
        setFrogedOpen(true);
        runCommand('open', { route });
    }

    const closeFroged = () => {
        setFrogedOpen(false);
        runCommand('close')
    }

    const set = (dataToSet: any) => {
        runCommand('set', { dataToSet });
    }

    const track = (eventName: string, meta?: any) => {
        runCommand('track', { eventName, meta });
    }

    const showAutomessage = (idAutomessage: string) => {
        runCommand('automessage', { idAutomessage });
    }

    const showDocument = (idDocument: string) => {
        runCommand('document', { idDocument });
    }

    const logout = () => {
        runCommand('logout');
    }

    /**
     * Listen commands from webview
     */
    const messagesListener = new BehaviorSubject<{ command: string, params: any } | null>(null);
    messagesListener.subscribe(message => {
        if (!message) return;
        const { command, params } = message;
        switch (command) {
            case 'froged_closeRequest':
                closeFroged();
                break;
            case 'froged_openRequest':
                const requestId = params.requestId;
                openFroged(requestId);
                break;
            case 'froged_hook_onConnect':
                break;
            case 'froged_hook_onAuth':
                const { auth } = params;
                setFrogedUserId(auth.userId);
                break;
            case 'froged_hook_onInboxStatusUpdate':
                const { unreadMessagesCount } = params;
                setFrogedAlerted(unreadMessagesCount !== 0);
                break;
        }
    });

    //   UI
    return (
        <>
            <Text/>
            { !frogedOpen && frogedAlerted && <Button color="#ff0000" title="Open FROGED" onPress={() => openFroged()} /> }
            { !frogedOpen && !frogedAlerted && <Button color="#000000" title="Open FROGED" onPress={() => openFroged()} /> }
            <Button title="Track (eventName = 'localhost')" onPress={() => track('localhost', { url: 'ejemplo' })} />
            { !frogedUserId && <Button title="Login as Pedro" onPress={() => set({ userId: 'user_pedro', name: 'Pedro' })} /> }
            { !frogedUserId && <Button title="Login as Juan" onPress={() => set({ userId: 'user_juan', name: 'Juan' })} /> }
            { !!frogedUserId && <Button title={`Logout (${ frogedUserId })` } onPress={() => logout()} /> }
            <WebView 
                onMessage={(e) => {
                    const data = JSON.parse(e.nativeEvent.data);
                    let command = data.command;
                    let params = data.params;
                    messagesListener.next({ command, params });
                }}
                containerStyle={ frogedOpen ? {} : { display: 'none' }}
                source={{ uri: 'https://sdk.froged.com/sdk-wv.html?slug=xxxxxx' }}
                ref={ref => (webviewRef = ref)}
            ></WebView>
      </>
    );
}

export default App;
