import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

function BettingApp() {
  const [betInputs, setBetInputs] = useState({});
  const [bets, setBets] = useState({});
  const [balance, setBalance] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [signatureInput, setSignatureInput] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const contests = [
    { id: 1, title: "Capture the Flag", status: "Upcoming" },
    { id: 2, title: "Hackathon 2077", status: "Ongoing" },
    { id: 3, title: "Dark Web Puzzle", status: "Upcoming" },
  ];

  const { connection } = useConnection();
  const wallet = useWallet();

  // Fetch participants
  useEffect(() => {
    const fetchBalance = async () => {
      const response = await axios.get("http://localhost:3000/user/data");
      setParticipants(response.data.dumped);
    };
    fetchBalance();
  }, []);

  // Save wallet address to backend
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (!wallet.publicKey) return;
      try {
        const response = await fetch("https://your-backend.com/api/save-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: wallet.publicKey.toBase58() }),
        });
        if (!response.ok) throw new Error("Failed to save wallet address");
        console.log("✅ Wallet address saved to backend");
      } catch (error) {
        console.error("❌ Error saving wallet address:", error);
      }
    };
    saveWalletAddress();
  }, [wallet.publicKey]);

  // Handle input change
  const handleInputChange = (id, value) => {
    setBetInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Place bet
  const placeBet = async (id) => {
    const amount = parseFloat(betInputs[id]);
    if (!amount || amount <= 0) return alert("Enter a valid bet amount!");
    if (!wallet.publicKey) return alert("Please connect your wallet!");

    try {
      const recipient = new PublicKey("YOUR_SOLANA_WALLET_ADDRESS_HERE");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      await wallet.sendTransaction(transaction, connection);

      setBets((prev) => ({ ...prev, [id]: [...(prev[id] || []), amount] }));
      setBetInputs((prev) => ({ ...prev, [id]: "" }));

      const bal = await connection.getBalance(wallet.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
      alert(`✅ Bet placed: ${amount} SOL`);
    } catch (err) {
      console.error(err);
      alert("❌ Transaction failed: " + err.message);
    }
  };

  // Submit signature
  const submitSignature = async () => {
    // alert(`✅ Signature submitted: ${signatureInput}`);
    // setSignatureInput("");
    // setShowSignatureModal(false);
    const response = await axios.post("http://localhost:3000/user/checkTransfer");
    console.log(response);
  };

  // Copy wallet address
  const fixedAddress = "ACaRm2UvYudERXm9dHPZDVykLjKnJmV4pGU4bjzMaBrB";
  const copyAddress = () => {
    navigator.clipboard.writeText(fixedAddress);
    alert("📋 Wallet address copied!");
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar" style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
        <div className="logo">💀 HackArena</div>
        <div className="wallet-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{fixedAddress}</span>
          <button className="copy-btn" onClick={copyAddress}>📋 Copy</button>
        </div>
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Signature button styled same as Wallet button */}
          <button className="signature-btn" onClick={() => setShowSignatureModal(true)}>
            ✍️ Signature
          </button>
          <WalletMultiButton />
        </div>
      </nav>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#1c1c1c",
              color: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "320px",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSignatureModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <h3 style={{ marginBottom: "15px" }}>Enter Signature</h3>
            <input
              type="text"
              placeholder="Type your signature"
              value={signatureInput}
              onChange={(e) => setSignatureInput(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "15px",
                borderRadius: "6px",
                border: "1px solid #555",
                background: "#2c2c2c",
                color: "#fff",
              }}
            />
            <button
              onClick={submitSignature}
              style={{
                background: "#6200ea",
                color: "white",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="body-container">
        {/* Contests */}
        <div className="contest-box">
          <h2>⚡ Contests</h2>
          <ul>
            {contests.map((c) => (
              <li key={c.id}>
                <span>{c.title}</span>
                <span className={c.status === "Ongoing" ? "status ongoing" : "status upcoming"}>{c.status}</span>
              </li>
            ))}
          </ul>
          {/* Balance Below Contests */}
          <div className="balance-display" style={{ marginTop: "15px", fontWeight: "bold" }}>
            {wallet.publicKey ? (
              <span>Balance: {balance?.toFixed(2)} ◎</span>
            ) : (
              <span>Balance: --</span>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="participants-box">
          <h2>👾 Participants</h2>
          <ul>
            {participants.map((p, index) => (
              <li key={p.id} className="participant">
                <div className="participant-row">
                  <span className="participant-name">{index + 1}. {p.name}</span>
                  <div className="betting">
                    <input
                      type="number"
                      placeholder="Bet in SOL"
                      value={betInputs[p.id] || ""}
                      onChange={(e) => handleInputChange(p.id, e.target.value)}
                    />
                    <button className="bet-btn" onClick={() => placeBet(p.id)}>
                      Place Bet
                    </button>
                  </div>
                </div>
                {bets[p.id] && (
                  <div className="bets-list">
                    <strong>Your Bets:</strong>
                    <ul>
                      {bets[p.id].map((b, i) => (
                        <li key={i}>💰 {b} SOL</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <BettingApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
