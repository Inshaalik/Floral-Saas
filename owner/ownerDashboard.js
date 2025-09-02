// ownerDashboard.js
import { supabase } from "../js/supabaseClient.js";
import { requireRole } from "../js/session.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

document.addEventListener("DOMContentLoaded", async () => {
    // 1️⃣ Require owner role immediately
    const user = await requireRole(["owner"]);
    let owner = user;
    let tenant = null;
    let subUsers = [];
    let ownerTierLimit = 5; // default max sub-users

    // ----- DOM Elements -----
    const subUserTable = document.getElementById("subUserList");
    const inviteEmailInput = document.getElementById("inviteEmail");
    const inviteButton = document.getElementById("inviteButton");
    const navAdminBtn = document.getElementById("navAdminBtn");
    const navCalculatorBtn = document.getElementById("navCalculatorBtn");
    const navAnalyticsBtn = document.getElementById("navAnalyticsBtn");
    const homeBtn = document.getElementById("homeBtn");

    // ----- Helper Functions -----
    function renderSubUsers() {
        subUserTable.innerHTML = "";
        subUsers.forEach((user, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><button data-index="${i}" class="removeSubUser">Remove</button></td>
            `;
            subUserTable.appendChild(row);
        });
        addSubUserListeners();
    }

    function addSubUserListeners() {
        document.querySelectorAll(".removeSubUser").forEach(btn => {
            btn.addEventListener("click", async e => {
                const i = e.target.dataset.index;
                const userToRemove = subUsers[i];
                if (!userToRemove) return;

                // Delete from memberships first
                const { error: memError } = await supabase
                    .from("memberships")
                    .delete()
                    .eq("user_id", userToRemove.id)
                    .eq("tenant_id", tenant.id);

                if (memError) {
                    console.error(memError);
                    alert("Failed to remove membership: " + memError.message);
                    return;
                }

                subUsers.splice(i, 1);
                renderSubUsers();
                alert("Sub-user removed.");
            });
        });
    }

    // ----- Load Owner, Tenant, and Sub-Users -----
    async function loadOwnerAndSubUsers() {
        // 1️⃣ Fetch tenant(s) where this user is the owner
        const { data: tenantData, error: tenantError } = await supabase
            .from("tenants")
            .select("*")
            .eq("owner_id", owner.id)
            .limit(1)
            .single();

        if (tenantError || !tenantData) {
            console.error(tenantError);
            alert("Failed to load your shop/tenant.");
            return;
        }

        tenant = tenantData;

        // 2️⃣ Fetch sub-users for this tenant (role != 'owner')
        const { data: membershipData, error: membershipError } = await supabase
            .from("memberships")
            .select("user_id, role, profiles(email)")
            .eq("tenant_id", tenant.id)
            .neq("role", "owner");

        if (membershipError) {
            console.error(membershipError);
            alert("Failed to load sub-users: " + membershipError.message);
            return;
        }

        subUsers = membershipData.map(m => ({
            id: m.user_id,
            role: m.role,
            email: m.profiles?.email || "Unknown"
        }));

        renderSubUsers();
    }

    // ----- Invite Sub-User -----
    inviteButton.addEventListener("click", async () => {
        const email = inviteEmailInput.value.trim().toLowerCase();
        if (!email) {
            alert("Enter a valid email to invite.");
            return;
        }

        if (subUsers.length >= ownerTierLimit) {
            alert(`You have reached your tier limit of ${ownerTierLimit} sub-users.`);
            return;
        }

        const inviteCode = uuidv4();
        const { error } = await supabase.from("subuser_invites").insert([{
            owner_id: owner.id,
            tenant_id: tenant.id,
            email,
            code: inviteCode,
            created_at: new Date()
        }]);

        if (error) {
            console.error(error);
            alert("Failed to create invite: " + error.message);
            return;
        }

        const inviteLink = `${window.location.origin}/signup.html?invite=${inviteCode}`;
        alert(`Invite link generated: ${inviteLink}`);
        inviteEmailInput.value = "";
    });

    // ----- Navigation -----
    navAdminBtn?.addEventListener("click", () => window.location.href = "../admin/index.html");
    navCalculatorBtn?.addEventListener("click", () => window.location.href = "../flowerCalculator.html");
    navAnalyticsBtn?.addEventListener("click", () => window.location.href = "../analytics/index.html");
    homeBtn?.addEventListener("click", () => window.location.href = "./owner/ownerDashboard.html");

    // ----- Initialize -----
    await loadOwnerAndSubUsers();
});
